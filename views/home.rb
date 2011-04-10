module Views
  class Home < Layout

    def raw_trips_template
      raw_template('trips_page')
    end

    def raw_other_location_template
      raw_template('other_location_page')
    end

  private

      def raw_template(template_name)
        IO.read(File.dirname(__FILE__) + "/../templates/#{template_name}.mustache")
      end

  end
end
