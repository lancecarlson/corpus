desc "Compile js files"
task :compile do
  exec "coffee -o js -c src/*.coffee"
end

desc "Package corpus"
task :package do
  exec "coffee -jc src/*.coffee;mv concatenation.js corpus.js"
end

desc "Publish"
task :publish do
  exec "npm publish"
end

desc "Generate Documentaiton"
task :doc do
  which 'docco'
end

# Check for the existence of an executable.
def which(exec)
  return unless `which #{exec}`.empty?
  puts "#{exec} not found."
  exit
end
