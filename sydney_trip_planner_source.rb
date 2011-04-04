require 'nokogiri'
require 'open-uri'
require 'active_support/core_ext/object'
require 'active_support/core_ext/hash/indifferent_access.rb'

class SydneyTripPlannerSource

  def find_trips(origin, destination)
    request_params = request_params(origin, destination)

    doc = get_request(request_params)

    # Handle confirmation of origin or destination
    if doc.at_css('select#from')
      from_options = parse_options(doc, 'select#from')
      to_options = parse_options(doc, 'select#to')

      from_select = doc.at_css('select#from')
      unless from_select['name'].blank?
        request_params.delete(:itd_name_origin)
        request_params[from_select['name']] = from_options.first[1]
      end
      to_select = doc.at_css('select#to')
      unless to_select['name'].blank?
        request_params.delete(:itd_name_destination)
        request_params[to_select['name']] = to_options.first[1]
      end

      doc = get_request(request_params)
    end

    result_table = doc.at_css('.dataTbl')
    raise 'Unable to find result table' unless result_table

    results = []
    result_table.css('tbody tr').each do |row|
      results << {
                :trip_number => row.at_css('td:nth-child(1)').content.strip,
                :depart => row.at_css('td:nth-child(2)').content.strip,
                :arrive => row.at_css('td:nth-child(3)').content.strip,
                :travel_time => row.at_css('td:nth-child(4)').content.strip,
                :transport_type => transport_type(row.at_css('td:nth-child(5)')),
                #:view_url => row.at_css('td:nth-child(6) a')['href']
      }
    end

    return results, from_options, to_options
  end


private

  def request_params(origin, destination)
    request_params = {}
    request_params[:itd_name_origin] = origin
    request_params[:itd_name_destination] = destination
    departure_time = DateTime.now
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
    raise "Error: #{doc.at_css('.error').content}" if doc.at_css('.error')
    return doc
  end

  def transport_type(column)
    column.css('img').collect { |img| img['alt'].gsub(/\s|icon/, '') }
  end

end

