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
        var allClassesPerDepartment = [];

        departments.forEach(function(department) {
          var classesPerDepartment = department.department;
          if (typeof classesPerDepartment === 'undefined') {
            allClassesPerDepartment.push(department);

          } else if (Object.prototype.toString.call(department.department) === '[object Array]') {
            classesPerDepartment.forEach(function(course) {
              allClassesPerDepartment.push(course);
            })
          } else {
            allClassesPerDepartment.push(classesPerDepartment);
          }
        });
        // res.json(200, allClassesPerDepartment);
        var allCourseSections = [];
        var newArray = allClassesPerDepartment.slice(210);

        async.each(newArray, function(coursePerDepartment, callback) {
          options = setHttpOptions('classes', coursePerDepartment.code, year, period);
          rest.get(options.host + options.path).on('complete', function(resultCourses) {
            var data = JSON.parse(resultCourses);
            var courses = data.OfferedCourses.course;
            if (Object.prototype.toString.call(courses) === '[object Array]') {
              courses.forEach(function(course) {
                var courseSections = course.CourseData.SectionData;
                if (Object.prototype.toString.call(courseSections) === '[object Array]') {
                  courseSections.forEach(function(section) {
                    allCourseSections.push(section);
                  });
                } else {
                  allCourseSections.push(courseSections);
                }
              });

            } else {
              var courseSections = courses.CourseData.SectionData;
              if (Object.prototype.toString.call(courseSections) === '[object Array]') {
                courseSections.forEach(function(section) {
                  allCourseSections.push(section);
                });
              } else {
                allCourseSections.push(courseSections);
              }
            }
            callback();
          });
        }, function(err) {
          if (err) {

          } else {
            res.json(200, allCourseSections);
          }
        });

        // allClassesPerDepartment.forEach(function(coursePerDepartment) {
        //   options = setHttpOptions('classes', coursePerDepartment.code, year, period);
        //   rest.get(options.host + options.path).on('complete', function(resultCourses) {
        //     var data = JSON.parse(resultCourses);
        //     var courses = data.OfferedCourses.course;
        //     courses.forEach(function(course) {
        //       var courseSections = course.CourseData.SectionData;
        //       if (Object.prototype.toString.call(courseSections) === '[object Array]') {
        //         courseSections.forEach(function(section) {
        //           allCourseSections.push(section);
        //         });
        //       } else {
        //         allCourseSections.push(section);
        //       }
        //     });
        //   });
        // });




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
