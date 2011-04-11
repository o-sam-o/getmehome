source :gemcutter

gem "sinatra", "~> 1.2.1"
gem "i18n", "~> 0.5.0"
gem "activesupport", "~> 3.0.5"
gem "tzinfo", "~> 0.3.26"
gem "nokogiri", "~> 1.4.4"
gem "mustache", "~> 0.99.3"
gem "geokit", "~> 1.5.0"

group :development do
  gem "shotgun", "~> 0.9"
  gem "heroku", "~> 1.19.1"
end

configure :production do
  require 'newrelic_rpm'
end
