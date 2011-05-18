this.Project = Model "project"
#Project.hasMany "todo_lists"

this.TodoList = Model "todo_list"
#TodoList.hasMany "todo_items"

this.TodoItem = Model "todo_item"

describe "Model instance", ->
  describe "attributes", ->
    beforeEach ->
      this.project = new Project(name: "New Project")

    it "can get an attribute", ->
      expect(this.project.get("name")).toEqual "New Project"

    it "can set an attribute", ->
      this.project.set "name", "Old Project"
      expect(this.project._attributes["name"]).toEqual "Old Project"

    it "can set many attributes at a time", ->
      this.project.set {name: "Cool Project", description: "A small project with huge potential"}
      expect(this.project._attributes["name"]).toEqual "Cool Project"
      expect(this.project._attributes["description"]).toEqual "A small project with huge potential"

    it "marks changes to newly set attributes and indicates it was changed", ->
      this.project.set "name", "Changed project"
      this.project.set "description", "Changed project description"
      expect(this.project.changes()).toEqual { name: "Changed project", description: "Changed project description" }
      expect(this.project.changed()).toEqual true

  describe "ajax persistence", ->
    beforeEach ->
      this.project = new Project(name: "Saving Project")

    it "saves the record and returns a success call", ->
      this.project.save
        success: (project) ->
          expect(project.id()).toEqual 5

  ###
  describe "associations", ->
    beforeEach ->
      this.project = new Project(name: "New Project")
      console.log "BEFORE"

    it "can add a record one at a time to a hasMany association", ->
      todo_list = new TodoList(title: "List1")
      this.project.todo_lists.add todo_list
      console.log this.project
      expect(this.project.todo_lists.records).toEqual todo_list

    it "can add several records at a time to a hasMany association", ->
      todo_lists = [new TodoList(title: "List1"), new TodoList(title: "List2"), new TodoList(title: "List3")]
      this.project.todo_lists.add todo_lists
      console.log this.project
      expect(this.project.todo_lists.records).toEqual todo_lists
  ###

