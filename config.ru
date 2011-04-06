require 'rubygems'
require 'bundler'

Bundler.require

require 'json'
require 'nokogiri'
require 'open-uri'
require 'active_support/core_ext/object'
require 'active_support/core_ext/hash/indifferent_access.rb'

require 'sinatra/base'
require 'mustache/sinatra'

require './views/layout'
require './sydney_trip_planner_source'
require './get_me_home'

run Sinatra::Application
