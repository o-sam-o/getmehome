module Views
  class Home < Layout

    def raw_trips_template
      raw_template('trips')
    end

    def raw_other_locations_template
      raw_template('other_locations')
    end

  private

      def raw_template(template_name)
        IO.read(File.dirname(__FILE__) + "/../templates/partials/#{template_name}.mustache")
      end

  end
end
