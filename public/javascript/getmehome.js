$(document).ready(function() {

  // Clear current lat and long on landing page
  $('#langing-page').live('pagebeforeshow',function(event, ui){
    $('current-lat-log-location').html('');
  });  

  //Flick to landing page if user has already seen welcome page
  if ($.cookie('gmh-address')){
    initAddressFields();
    $.mobile.changePage('#landing-page', "none", false, true);
  }

  $('.get-me-home-geo').click(function(e){
    e.preventDefault();
    getMeHome();
  });

  $.each(['origin', 'destination'], function(index, location) { 
    $('input[name=' + location + '-radio]').live('change', function(e){
        if ($('input[name=' + location + '-radio]:checked').val() == 'user-input'){
          $('#other-' + location + '-field').show("slow");
          $('input[name=other-' + location + ']').focus();
        }else{
          $('#other-' + location + '-field').hide("slow");
        }
    });
  });

  $('.get-me-home-change-location').live('click', function(e){
    e.preventDefault();
    selectedOtherLocation();
  });

  $('#manual-address-button').click(function(e){
    e.preventDefault();

    var origin = $('input[name=manual-from-address]').val();
    if (origin == ''){
      alert('Please provide a from address');
      return;
    }

    var destination = $('input[name=manual-to-address]').val();
    if (destination == ''){
      alert('Please provide a to address');
      return;
    }

    lookupTimetableFor(origin, destination);
  });

  $('#enter-address-button').click(function(e){
    e.preventDefault();

    var address = $('input[name=address]').val();
    if (address == ''){
      alert('Please provide an address');
      return;
    }

    saveAddressToCookie(address);
    $.mobile.changePage('#landing-page', "slide", false, true);
  });

});

function getMeHome(){
  $.mobile.pageLoading();
  
  // TODO add support for bad browser
  navigator.geolocation.getCurrentPosition(function(position){
    $('.current-lat-log-location').html('Your current location is Lat: ' + position.coords.latitude.toFixed(2) + ' Long: ' + position.coords.longitude.toFixed(2));

    $.ajax({
      url: '/trip',
      data: "from_lat=" + position.coords.latitude + "&from_long=" + position.coords.longitude + "&to=" + $.cookie('gmh-address'),
      success: function(data) {
        populateTripsPage(data.data);
        $.mobile.pageLoading( true );
        $.mobile.changePage('#trips-page', "slide", false, true);
      },
      error: function() { 
        $.mobile.pageLoading( true );
        $.mobile.changePage('#fail-page', "pop", false, true);
      }
    });

  });
}

function selectedOtherLocation(){
  var origin = getOtherDestinationSelection('origin');
  var destination = getOtherDestinationSelection('destination');
  lookupTimetableFor(origin, destination);
}

function lookupTimetableFor(origin, destination){
  saveAddressToCookie(destination);
  $.mobile.pageLoading();

  $.ajax({
    url: '/trip',
    data: "from=" + origin + "&to=" + destination,
    success: function(data) {
      populateTripsPage(data.data);
      $.mobile.pageLoading( true );
      $.mobile.changePage('#trips-page', "slide", false, true);
    },
    error: function() { 
       $.mobile.pageLoading( true );
       $.mobile.changePage('#fail-page', "pop", false, true);
     }
  });
}


function populateTripsPage(data){
  updatePageContents('#trips-page', '#trip-template', data);
  updatePageContents('#change-origin-page', '#other-location-template', data.origin);
  updatePageContents('#change-destination-page', '#other-location-template', data.destination);
}

function updatePageContents(pageId, templateId, data){
  // Note: we have to create a dummy container div as you can only call
  // .page() once per element
  var newContent = $('<div></div>');
  newContent.html(Mustache.to_html($(templateId).html(), data)).page();
  $(pageId + ' .content').html(newContent);
}

function saveAddressToCookie(address) {
  $.cookie('gmh-address', address, { path: '/', expires: 365 });
  initAddressFields();
}

function initAddressFields(){
  $('.home-address').html($.cookie('gmh-address'));
  $('input[name=address]').val($.cookie('gmh-address'));
  $('input[name=manual-to-address]').val($.cookie('gmh-address'));
}

function getOtherDestinationSelection(location){
  var selection = $('input:radio[name=' + location + '-radio]:checked').val();

  if (selection == 'user-input'){
    selection = $('input[name=other-' + location + ']').val();
    if (selection == ''){
      alert('Please provide an address');
      throw 'missing address';
    }
  }

  return selection;
}
