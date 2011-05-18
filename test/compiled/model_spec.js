(function() {
  this.Project = Model("project");
  this.TodoList = Model("todo_list");
  this.TodoItem = Model("todo_item");
  describe("Model instance", function() {
    describe("attributes", function() {
      beforeEach(function() {
        return this.project = new Project({
          name: "New Project"
        });
      });
      it("can get an attribute", function() {
        return expect(this.project.get("name")).toEqual("New Project");
      });
      it("can set an attribute", function() {
        this.project.set("name", "Old Project");
        return expect(this.project._attributes["name"]).toEqual("Old Project");
      });
      it("can set many attributes at a time", function() {
        this.project.set({
          name: "Cool Project",
          description: "A small project with huge potential"
        });
        expect(this.project._attributes["name"]).toEqual("Cool Project");
        return expect(this.project._attributes["description"]).toEqual("A small project with huge potential");
      });
      return it("marks changes to newly set attributes and indicates it was changed", function() {
        this.project.set("name", "Changed project");
        this.project.set("description", "Changed project description");
        expect(this.project.changes()).toEqual({
          name: "Changed project",
          description: "Changed project description"
        });
        return expect(this.project.changed()).toEqual(true);
      });
    });
    return describe("ajax persistence", function() {
      beforeEach(function() {
        return this.project = new Project({
          name: "Saving Project"
        });
      });
      return it("saves the record and returns a success call", function() {
        return runs(function() {
          return this.project.save({
            success: function(project) {
              return expect(project.id()).toEqual(5);
            }
          });
        });
      });
    });
    /*
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
    */
  });
}).call(this);
