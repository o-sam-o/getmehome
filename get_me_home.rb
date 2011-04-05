get '/trip' do
  content_type 'application/json'
  begin
    {
      status: "success",
      data: SydneyTripPlannerSource.new.find_trips(params[:to], params[:from])
    }.to_json
  rescue TripSourceException => e
    halt 417, {
      status: "fail",
      message: e.message,
      code: e.code
    }.to_json
  end
end
