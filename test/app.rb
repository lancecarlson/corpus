require "sinatra"
require "json"

set :public, File.dirname(__FILE__)
set :views, File.dirname(__FILE__)

def root_path(dir)
  File.dirname(__FILE__) + "/../#{dir}/"
end

def all_files(path)
  Dir.glob(root_path(path) + "*").map{|f| File.basename f}
end

get "/" do
  `cd .. && rake compile_tests`
  @vendor_files = all_files "vendor"
  @js_files = all_files "js"
  @spec_files = all_files "test/compiled"
  erb :index
end

get "/assets/:type/:file" do
  File.read(root_path(params[:type]) + params[:file])
end

get "/posts" do
  {
    :title => "Some post",
    :body => "Lorem Ipsum This is the body"
  }.to_json
end
