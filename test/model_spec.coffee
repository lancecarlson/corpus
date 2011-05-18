this.Project = Model "project"
Project.hasMany "todo_lists"

this.TodoList = Model "todo_list"
TodoList.hasMany "todo_items"

this.TodoItem = Model "todo_item"

describe "Model instance", ->
  describe "attributes", ->
    beforeEach ->
      this.project = new Project(name: "New Project")

    it "should let you get an attribute", ->
      expect(this.project.get("name")).toEqual "New Project"

    it "should let you set an attribute", ->
      this.project.set "name", "Old Project"
      expect(this.project._attributes["name"]).toEqual "Old Project"
