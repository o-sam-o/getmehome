module Views
  class Layout < Mustache
    def title 
      @title || "Get Me Home"
    end
  end
end
