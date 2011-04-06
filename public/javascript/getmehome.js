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

  $('#get-me-home-form-button').click(function(e){
    e.preventDefault();
    $.mobile.pageLoading();	

    $.ajax({
      url: '/trip',
      data: "from=" + $('#trip-form input[name=from]').val() + "&to=" + $('#trip-form input[name=to]').val(),
      success: function(data) {
        $.each(data.data.trips, function(index, trip){
          $('#trips-list').append('<li>' + trip.depart + '</li>');
        });
        $.mobile.pageLoading( true );
        $.mobile.changePage($('#trips-page'));
      }
    });

  });
});

function getMeHome(){
  $.mobile.pageLoading();	  
  
  navigator.geolocation.getCurrentPosition(function(position){
    $('.current-lat-log-location').html('Your current location is Lat: ' + position.coords.latitude + ' Long: ' + position.coords.longitude);

    $.ajax({
      url: '/trip',
      data: "from_lat=" + position.coords.latitude + "&from_long=" + position.coords.longitude + "&to=" + $.cookie('gmh-address'),
      success: function(data) {
        $.each(data.data.trips, function(index, trip){
          $('#trips-list').append('<li>' + trip.depart + '</li>');
        });
        $.mobile.pageLoading( true );
        $.mobile.changePage($('#trips-page'));
      }
    });

  });
}

