module Views
  class Home < Layout

    def raw_trips_template
      IO.read(File.dirname(__FILE__) + '/../templates/trips_page.mustache')
    end

  end
end
