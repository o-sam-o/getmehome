class SydneyTripPlannerSource

  def find_trips(origin, destination)
    request_params = request_params(origin, destination)

    doc = get_request(request_params)

    # Handle confirmation of origin or destination
    if doc.at_css('select#from') && doc.at_css('select#to')
      origin_options = parse_options(doc, 'select#from')
      destination_options = parse_options(doc, 'select#to')

      from_select = doc.at_css('select#from')
      unless from_select['name'].blank?
        request_params.delete(:itd_name_origin)
        origin = origin_options.first[1]
        request_params[from_select['name']] = origin
      end

      to_select = doc.at_css('select#to')
      unless to_select['name'].blank?
        request_params.delete(:itd_name_destination)
        destination = destination_options.first[1]
        request_params[to_select['name']] = destination
      end

      doc = get_request(request_params)
    end

    result_table = doc.at_css('.dataTbl')
    raise TripSourceException.new('No results found', :no_results) unless result_table

    origin_name = doc.css('.fe_rd_srchval')[0].content.strip
    destination_name = doc.css('.fe_rd_srchval')[1].content.strip

    results = []
    result_table.css('tbody tr').each do |row|
      results << {
                tripNumber: row.at_css('td:nth-child(1)').content.strip,
                depart: row.at_css('td:nth-child(2)').content.strip,
                arrive: row.at_css('td:nth-child(3)').content.strip,
                travelTime: row.at_css('td:nth-child(4)').content.strip,
                transportType: transport_type(row.at_css('td:nth-child(5)')),
                viewUrl: row.at_css('td:nth-child(6) a')['href']
      }
    end

    return {
      trips: results,
      origin: {
        name: origin_name,
        id:   origin,
        others: origin_options || {origin_name => origin_name},
        othersCount: origin_options.try(:size) || 1
      },
      destination: {
        name: destination_name,
        id:   destination,
        others: destination_options || {destination_name => destination_name},
        othersCount: destination_options.try(:size) || 1
      },
    }
  end


private

  def request_params(origin, destination)
    request_params = {}
    request_params[:itd_name_origin] = origin
    request_params[:itd_name_destination] = destination
    departure_time = DateTime.now.in_time_zone("Sydney")
    request_params[:itd_itdDate] = departure_time.strftime('%Y%m%d')
    request_params[:itd_itdTripDateTimeDepArr] = 'dep'

    request_params[:itd_itdTimeHour] = departure_time.strftime('%I')
    request_params[:itd_itdTimeMinute] = departure_time.strftime('%M')
    request_params[:itd_itdTimeAMPM] = departure_time.strftime('%p').downcase

    # Used to define the 'type' of origin and destination e.g. station, landmark, address
    # All => 0, Address => 29, Landmark => 32, Station => 2
    request_params[:itd_anyObjFilter_origin] = '29'
    request_params[:itd_anyObjFilter_destination] = '29'

    # invalidate session as we want stateless requests
    request_params[:session] = 'invalidate'
    request_params[:itd_cmd] = 'invalid'

    return request_params
  end

  def parse_options(doc, select_selector)
    doc.css("#{select_selector} option").inject({}) do |result, option| 
      result[option.content] = option['value'].blank? ? option.content : option['value']
      result
    end
  end

  def get_request(request_params)
    url = "http://www.131500.com.au/plan-your-trip/trip-planner?" + request_params.collect { |k,v| URI.escape("#{k}=#{v}") }.join('&')
    doc = Nokogiri::HTML(open(url))
    raise TripSourceException.new(doc.at_css('.error').content, :request_failure) if doc.at_css('.error')
    return doc
  end

  def transport_type(column)
    column.css('img').collect { |img| img['alt'].gsub(/\s|icon/, '') }
  end

end

class TripSourceException < Exception
  attr_reader :code
  def initialize(message, code)
    super(message)
    @code = code
  end
end
