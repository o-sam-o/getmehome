$(document).ready(function() {

  $('#get-me-home-button').click(function(e){
    e.preventDefault();
    getMeHome();
  });

  $('#enter-address-button').click(function(e){
    e.preventDefault();

    var address = $('input[name=address]').val();
    if (address == ''){
      alert('Please provide an address');
      return;
    }

    $.cookie('gmh-address', address, { path: '/', expires: 365 });
    // TODO find a way to do this before page switch occurs
    $('.home-address').html(address);
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

function populateTripsPage(data){
  $('#change-origin-page .content').html(Mustache.to_html($('#other-location-template').html(), data.origin)).page();
  $('#change-destination-page .content').html(Mustache.to_html($('#other-location-template').html(), data.destination)).page();
  $('#trips-page .content').html(Mustache.to_html($('#trip-template').html(), data)).page();
}
