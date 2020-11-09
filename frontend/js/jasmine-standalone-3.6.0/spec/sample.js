describe ("Unit Testing", function() {
  var obj;

  beforeEach(function() {
    obj = new unitTesting();
  });

  describe("Addition", function() {
    it("perform addition", function() {
      expect(obj.sum(3,5)).toEqual(8);
    })
  });

  describe("database connection", function() {
    it("input fields for database connection", function() {
      expect(obj.dbConnection('mysql', 'localhost', '3306', 'root', 'sakila', 'Searce@123')).toEqual(true)
    })
  });
})