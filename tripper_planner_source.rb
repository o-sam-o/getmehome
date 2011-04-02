require 'nokogiri'
require 'open-uri'
require 'active_support/core_ext/object'
require 'active_support/core_ext/hash/indifferent_access.rb'

def parse_options(doc, select_selector)
  doc.css("#{select_selector} option").inject({}) do |result, option| 
    result[option.content] = option['value'].blank? ? option.content : option['value']
    result
  end
end

def get_request(request_params)
  url = "http://www.131500.com.au/plan-your-trip/trip-planner?" + request_params.collect { |k,v| URI.escape("#{k}=#{v}") }.join('&')
  p url
  #url = "http://www.131500.com.au/plan-your-trip/trip-planner?itd_itdDate=20110402&itd_itdTripDateTimeDepArr=dep&itd_itdTimeHour=12&itd_itdTimeMinute=30&itd_itdTimeAMPM=pm&itd_name_origin=King+St%2C+Newtown&select_destination=stateless%3AstreetID%3A34%3A%3A95301001&x=40&y=16"
  doc = Nokogiri::HTML(open(url))
  raise "Error: #{doc.at_css('.error').content}" if doc.at_css('.error')
  return doc
end

def transport_type(column)
  column.css('img').collect { |img| img['alt'].gsub(/\s|icon/, '') }
end

=begin

# Worked with expired session warning
http://www.131500.com.au/plan-your-trip/trip-planner?
itd_itdDate=20110402&
itd_itdTripDateTimeDepArr=dep&
itd_itdTimeHour=12
&itd_itdTimeMinute=30&
itd_itdTimeAMPM=pm&
itd_name_origin=King+St%2C+Newtown&
select_destination=stateless%3AstreetID%3A34%3A%3A95301001&
x=40
&y=16

# Working without address confirmation page
http://www.131500.com.au/plan-your-trip/trip-planner?session=invalidate&itd_anyObjFilter_origin=29&itd_name_origin=Newtown&itd_anyObjFilter_destination=29&itd_name_destination=Manly&itd_itdDate=20110402&itd_itdTripDateTimeDepArr=dep&itd_itdTimeHour=3&itd_itdTimeMinute=30&itd_itdTimeAMPM=am&itd_includedMeans=checkbox&itd_inclMOT_7=1&itd_inclMOT_5=Bus&itd_inclMOT_1=Train&itd_inclMOT_9=Ferry&itd_trITMOT=100&itd_trITMOTvalue100=15&itd_changeSpeed=normal&itd_routeType=LEASTTIME&x=48&y=21

=end

request_params = {}
request_params[:itd_name_origin] = 'King St, Newtown'
request_params[:itd_name_destination] = 'George St'
request_params[:itd_itdDate] = '20110402' #'+1'
request_params[:itd_itdTripDateTimeDepArr] = 'dep'

# TODO set time to now!
request_params[:itd_itdTimeHour] = '15'
request_params[:itd_itdTimeMinute] = '30'
request_params[:itd_itdTimeAMPM] = 'pm'

# Used to define the 'type' of origin and destination e.g. station, landmark, address
# All => 0, Address => 29, Landmark => 32, Station => 2
request_params[:itd_anyObjFilter_origin] = '29'
request_params[:itd_anyObjFilter_destination] = '29'

# TODO determine what these mean
request_params[:session] = 'invalidate'
request_params[:itd_cmd] = 'invalid'

doc = get_request(request_params)


if doc.at_css('select#from')
  from_options = parse_options(doc, 'select#from')
  to_options = parse_options(doc, 'select#to')

  p from_options
  p to_options
  
  from_select = doc.at_css('select#from')
  unless from_select['name'].blank?
    p "Changing origin to #{from_options.first}"
    request_params.delete(:itd_name_origin)
    request_params[from_select['name']] = from_options.first[1]
  end
  to_select = doc.at_css('select#to')
  unless to_select['name'].blank?
    p "Changing destination to #{to_options.first}"
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

p results
