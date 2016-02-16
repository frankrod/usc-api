var rest = require('restler');
var async = require('async');

module.exports = {
  allClasses: function(req, res) {
    var year = req.params.year;
    var period = req.params.period;
    var options = setHttpOptions('depts', null, year, period);
    rest.get(options.host + options.path).on('complete', function(result) {
      if (result instanceof Error) {
        console.log('Error:', result.message);
        this.retry(5000); // try again after 5 sec
      } else {
        var data = JSON.parse(result);
        var departments = data.department;
        // departments.forEach(function(department) {
        async.each(departments, function(department, callback) {
          var classesPerDepartment = department.department;
          if (typeof(classesPerDepartment) === 'undefined') {

            options = setHttpOptions('classes', department.code, 2016, 1);
            // sails.log(options.host + options.path);
            rest.get(options.host + options.path).on('complete', function(resultClassesPerDepartment) {
              // sails.log(result);
            });
          } else if (Object.prototype.toString.call(classesPerDepartment) === '[object Array]') {
            classesPerDepartment.forEach(function(classPerDepartment) {

              options = setHttpOptions('classes', classPerDepartment.code, 2016, 1);
              // sails.log(options.host + options.path);
              rest.get(options.host + options.path).on('complete', function(resultClassPerDepartmentArray) {

              });
            });
          } else {
            options = setHttpOptions('classes', classesPerDepartment.code, 2016, 1);
            rest.get(options.host + options.path).on('complete', function(result) {
              // sails.log(typeof result);
              var classResult = JSON.parse(result);
              if (Object.prototype.toString.call(classResult) === "[object Object]") {
                var courses = classResult.OfferedCourses.course;
                var coursesToSave = [];

                courses.forEach(function(course) {
                  var publishedCourseID = course.PublishedCourseID;
                  var title = course.CourseData.title;
                  var sections = course.CourseData.SectionData;

                  coursesToSave.push({
                    publishedCourseID: publishedCourseID,
                    title: title
                  })

                });

                Course.create(coursesToSave).exec(function(err, created) {
                  if (err) {
                    sails.log(err);
                  } else {
                    callback();
                    sails.log(created);
                  }
                });

              } else {
                sails.log('no tipo object')
              }

            });
          }
        }, function(err) {
          if (err) {

          } else {
            sails.log('Termino todo!');
          }
        });
        // });
        // return res.send("Hi there!");
      }
    });
  }
};

function setHttpOptions(apiToCall, classCode, year, period) {
  switch (apiToCall) {
    case 'classes':
      return options = {
        host: "http://web-app.usc.edu",
        path: "/web/soc/api/classes/" + classCode + "/" + year + period
      };
    case 'depts':
      return options = {
        host: "http://web-app.usc.edu",
        path: "/web/soc/api/depts/" + year + period
      };
    default:
      break;
  }
}
