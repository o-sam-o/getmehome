get '/trip' do
  SydneyTripPlannerSource.new.find_trips(params[:to], params[:from]).to_json
end
