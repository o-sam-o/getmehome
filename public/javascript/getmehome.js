$(document).ready(function() {

  $('#get-me-home-button, #get-me-home-icon').click(function(e){
    e.preventDefault();
    getMeHome();
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
    $.mobile.changePage($('#landing-page'));
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
        $.mobile.changePage($('#trips-page'));
      }
    });

  });
}

function selectedOtherLocation(){
  $.mobile.pageLoading();
  saveAddressToCookie($('input:radio[name=destination-radio]:checked').val());
  // TODO add error handling
  $.ajax({
    url: '/trip',
    data: "from=" + $('input:radio[name=origin-radio]:checked').val() + "&to=" + $('input:radio[name=destination-radio]:checked').val(),
    success: function(data) {
      populateTripsPage(data.data);
      $.mobile.pageLoading( true );
      $.mobile.changePage($('#trips-page'));
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
  $('.home-address').html(address);
}
