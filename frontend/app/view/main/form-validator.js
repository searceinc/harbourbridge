$(document).ready(function () {
    setActiveSelectedMenu('homeScreen');
    $(".modal-backdrop").hide();
    jQuery('#loadDbForm > div > input').keyup(function () {
      let empty = false;
      jQuery('#loadDbForm > div > input').each(function () {
        if (jQuery(this).val() === '') {
          empty = true;
        }
      });
      if (empty) {
        jQuery('#loadConnectButton').attr('disabled', 'disabled');
      } else {
        jQuery('#loadConnectButton').removeAttr('disabled');
      }
    });
    jQuery('#connectForm > div > input').keyup(function () {
      let empty = false;
      jQuery('#connectForm > div > input').each(function () {
        if (jQuery(this).val() === '') {
          empty = true;
        }
      });
      if (empty) {
        jQuery('#connectButton').attr('disabled', 'disabled');
      }
      else {
        jQuery('#connectButton').removeAttr('disabled');
      }
    });
    jQuery('#importForm > div > input').keyup(function () {
      let empty = false;
      jQuery('#importForm > div > input').each(function () {
        if (jQuery(this).val() === '') {
          empty = true;
        }
      });
      if (empty) {
        jQuery('#importButton').attr('disabled', 'disabled');
      }
      else {
        jQuery('#importButton').removeAttr('disabled');
      }
    });
  });
  sessionArray = JSON.parse(sessionStorage.getItem('sessionStorage'));
  if (sessionArray !== null) {
    let sessionArrayLength = sessionArray.length;
    let session, sessionName, sessionDate, sessionTime, $sessionTableRow;
    jQuery('.sessionTableImg').addClass('template');
    jQuery('.sessionTableNoContent').addClass('template');
    let http = new XMLHttpRequest();
    for (var x = 0; x < sessionArrayLength; x++) {
      session = sessionArray[x];
      timestampArray = session.createdAt.split(' ');
      sessionName = session.filePath.split('/');
      sessionName = sessionName[sessionName.length - 1];

      http.open('HEAD', './' + sessionName, false);
      http.send();
      if (http.status !== 200) {
        sessionArray.splice(x, 1);
        sessionStorage.setItem('sessionStorage', JSON.stringify(sessionArray));
        continue;
      }

      sessionDate = [timestampArray[0], timestampArray[1], timestampArray[2], timestampArray[3]].join(' ');
      sessionTime = [timestampArray[4], timestampArray[5]].join(' ');
      $sessionTableRow = jQuery('.sessions.template').clone().removeClass('template');
      $sessionTableRow.find('.col-2.session-table-td2.sessionName').html(sessionName);
      $sessionTableRow.find('.col-4.session-table-td2.sessionDate').html(sessionDate);
      $sessionTableRow.find('.col-2.session-table-td2.sessionTime').html(sessionTime);
      $sessionTableRow.find('.col-4.session-table-td2.session-action > a').attr('id', x);
      $sessionTableRow.find('.col-4.session-table-td2.session-action > a').click(function () {
        resumeSessionHandler(jQuery(this).attr('id'), sessionArray);
      });
      $sessionTableRow.appendTo('#session-table-content');
    }
    if (sessionArray.length == 0) {
      jQuery('.sessionTableImg').removeClass('template');
      jQuery('.sessionTableNoContent').removeClass('template');
    }
  }