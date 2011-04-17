include Geokit::Geocoders

set :mustache, {
  :views     => './views',
  :templates => './templates'
}

get '/' do
  mustache :home
end

get '/trip' do
  content_type 'application/json'
  begin
    {
      status: "success",
      data: SydneyTripPlannerSource.new.find_trips(trip_origin, params[:to])
    }.to_json
  rescue TripSourceException => e
    halt 417, {
      status: "fail",
      message: e.message,
      code: e.code
    }.to_json
  end
end

def trip_origin
    params[:from] || GoogleGeocoder.reverse_geocode([params[:from_lat], params[:from_long]]).full_address
end
