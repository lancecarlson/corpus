desc "Compile js files"
task :compile do
  exec "coffee -o js -c src/*.coffee"
end

desc "Package corpus"
task :package do
  exec "coffee -jc src/*.coffee;mv concatenation.js corpus.js"
end
