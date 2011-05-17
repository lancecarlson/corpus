require "sinatra"
require "json"

get "/posts" do
  {
    :title => "Some post",
    :body => "Lorem Ipsum This is the body"
  }.to_json
end
