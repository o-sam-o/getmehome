$(document).ready(function() {
  //Flick to landing page if user has already seen welcome page
  if ($.cookie('gmh-address')){
    initAddressFields();
    $.mobile.changePage('#landing-page', "none", false, true);
  }

  $('#get-me-home-button, #get-me-home-icon').click(function(e){
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
  
  navigator.geolocation.getCurrentPosition(function(position){
    $('.current-lat-log-location').html('Your current location is Lat: ' + position.coords.latitude + ' Long: ' + position.coords.longitude);

    // TODO add error handling
    $.ajax({
      url: '/trip',
      data: "from_lat=" + position.coords.latitude + "&from_long=" + position.coords.longitude + "&to=" + $.cookie('gmh-address'),
      success: function(data) {
        populateTripsPage(data.data);
        $.mobile.pageLoading( true );
        $.mobile.changePage('#trips-page', "slide", false, true);
      }
    });

  });
}

function selectedOtherLocation(){
  var origin = getOtherDestinationSelection('origin');
  var destination = getOtherDestinationSelection('destination');
  saveAddressToCookie(destination);
  $.mobile.pageLoading();

  // TODO add error handling
  $.ajax({
    url: '/trip',
    data: "from=" + origin + "&to=" + destination,
    success: function(data) {
      populateTripsPage(data.data);
      $.mobile.pageLoading( true );
      $.mobile.changePage('#trips-page', "slide", false, true);
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
  $('input[name=address]').val($.cookie('gmh-address'))
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
