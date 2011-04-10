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
  // Note : Need to do .page or jQuery Mobile doesn't work
  $('#trips-page .content').html(Mustache.to_html($('#trip-template').html(), data)).page();
  $('#change-origin-page .content').html(Mustache.to_html($('#other-location-template').html(), data.origin)).page();
  $('#change-destination-page .content').html(Mustache.to_html($('#other-location-template').html(), data.destination)).page();
}

function saveAddressToCookie(address) {
  $.cookie('gmh-address', address, { path: '/', expires: 365 });
  $('.home-address').html(address);
}
