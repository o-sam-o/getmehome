$(document).ready(function() {
  $('#get-me-home-button').click(function(e){
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




