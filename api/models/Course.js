module.exports = {

  attributes: {
    publishedCourseID: {
      type: 'string',
      required: true,
      unique: true
    },
    title: {
      type: 'string',
      required: true
    },
    sections: {
      collection: 'section',
      via: 'course'
    }
  }
};
