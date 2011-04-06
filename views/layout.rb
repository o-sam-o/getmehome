#class App
  module Views
    class Layout < Mustache
      def title 
        @title || "Take Me Home"
      end
    end
  end
#end
