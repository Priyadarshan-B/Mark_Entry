const cron = require('node-cron');
const { get_database, post_database } = require("../../config/db_utils");

const updateEditStatus = async () => {
  try {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const courseQuery = `
      UPDATE course
      SET edit_status = '0'
      WHERE due_date <= ? AND edit_status != '0'
    `;
    await post_database(courseQuery, [now], "Course edit_status updated.");

    const dueDatesQuery = `
      UPDATE due_dates
      SET edit_status = '0'
      WHERE date <= ? AND edit_status != '0'
    `;
    await post_database(dueDatesQuery, [now], "Due dates edit_status updated.");

    console.log('Edit statuses updated successfully.');
  } catch (error) {
    console.error('Error updating edit_status:', error.message);
  }
};

const startCronJobs = () => {
  cron.schedule('* * * * *', async () => {
    console.log('Running cron job to update edit_status...');
    await updateEditStatus();
  });
};

module.exports = startCronJobs;
