// https://qiita.com/tadaken3/items/5f916a12587e42ece814
// https://news.mynavi.jp/article/apps_script-6/
// https://qiita.com/kazu56/items/cca24cfdca4553269cab

function sendSchedule(){
  //GASのスクリプトプロパティの取得
  const scriptProperty = PropertiesService.getScriptProperties().getProperties();
  //LINEのAPIトークン
  const token = scriptProperty.LINE_TOKEN;
  //GooglecalendarID
  const calId = scriptProperty.CAL_ID;
  
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //変数定義
  var events = [];
  var message = "";
  var options = {};
  options.method = "post";
  options.headers = {"Authorization" : "Bearer "+ token};
  
  //日付
  const cal = CalendarApp.getCalendarById(calId);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); //今日
  var startDate = new Date();
  var endDate = new Date();
  const wChars = [ "日", "月", "火", "水", "木", "金", "土" ];
  const todayChar = wChars[today.getDay()];

  
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //翌日の予定
  //※金曜、日曜以外に実行（金曜は週末の予定を、日曜は来週の予定を送信）
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//  if(todayChar != "金" && todayChar != "日"){
//    events = [];
//    message = "🦉やっほー\n\n";
//    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); //今日
//    startDate.setDate(startDate.getDate() + 1); //翌日
//    
//    Logger.log("Tomorrow");
//    Logger.log(startDate);
//    events = cal.getEventsForDay(startDate);
//    Logger.log(events.length);
//    
//    message += Utilities.formatDate(startDate,"GMT+0900","明日M/d(")
//    + wChars[startDate.getDay()] 
//    + ")の予定は\n";
//    
//    if(events.length > 0){
//      for (var i=0; i<events.length; i++){
//        message += Utilities.formatDate(events[i].getStartTime(),"GMT+0900","HH:mm ") 
//        + events[i].getTitle() 
//        + "\n";
//      }
//    }else{
//      message += "フリーだよ！\n";
//    }
//    
//    options.payload = "message=" + encodeURIComponent(message);
//    UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
//  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //週末の予定
  //※金曜に実行
  //→翌日(土曜)～翌々日(日曜)の予定を通知（★祝日？）
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  if(todayChar == "金"){
    events = [];
    message = "🦉やっほー\n\n";
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); //今日
    startDate.setDate(startDate.getDate() + 1); //翌日(土曜)
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); //今日
    endDate.setDate(endDate.getDate() + 3); //翌々日(日曜)の次の日

    Logger.log("Weekend");
    Logger.log(startDate);
    Logger.log(endDate);
    events = cal.getEvents(startDate, endDate);
    Logger.log(events.length);
    
    message += "週末の予定は\n";
    if(events.length > 0){
      for (var i=0; i<events.length; i++){
        message += Utilities.formatDate(events[i].getStartTime(),"GMT+0900","M/d(")
        + wChars[events[i].getStartTime().getDay()] 
        + Utilities.formatDate(events[i].getStartTime(),"GMT+0900",")HH:mm ")
        + events[i].getTitle() 
        + "\n";
      }
    }else{
      message += "フリーだよおおおお！\n";
    }
    
    options.payload = "message=" + encodeURIComponent(message);
    UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
  }  
  
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //来週の予定
  //※日曜に実行
  //→翌日(月曜)～次の日曜までの予定を通知（★祝日？）
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  if(todayChar == "日"){
    events = [];
    message = "🦉やっほー\n\n";
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); //今日
    startDate.setDate(startDate.getDate() + 1); //翌日(月曜)
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); //今日
    endDate.setDate(endDate.getDate() + 8); //翌日(月曜)の1週間後

    Logger.log("Week");
    Logger.log(startDate);
    Logger.log(endDate);
    events = cal.getEvents(startDate, endDate);
    Logger.log(events.length);

//    //開始時刻がstartDateより前の予定は除外する
//    for (var i = events-1; i >= 0; i--) {
//      if(events[i].getStartTime() < startDate.getTime()){
//        events.splice(i, 1);
//      }
//    }

    message += "今週の予定は\n";
    if(events.length > 0){
      for (var i=0; i<events.length; i++){
        message += Utilities.formatDate(events[i].getStartTime(),"GMT+0900","M/d(")
        + wChars[events[i].getStartTime().getDay()] 
        + ") " 
        + events[i].getTitle() 
        + "\n";
      }
    }else{
      message += "ナニモナイヨ\n";
    }
    
    options.payload = "message=" + encodeURIComponent(message);
    UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
  } 

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //1ヵ月間の予定（終日予定のみ）
  //※日曜に実行
  //→次の日曜の翌日(＝次の次の月曜)～今日の1ヶ月後の予定を通知
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//  if(todayChar == "日"){
//    events = [];
//    message = "🦉ほっほー\n\n";
//    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); //今日
//    startDate.setDate(startDate.getDate() + 8); //1週間後(日曜)の翌日(月曜)
//    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); //今日
//    endDate.setMonth(endDate.getMonth() + 1); //今日の1ヶ月後
//
//    Logger.log("Month");
//    Logger.log(startDate);
//    Logger.log(endDate);
//    events = cal.getEvents(startDate, endDate);
//    Logger.log(events.length);
//
////    //開始時刻がstartDateより前の予定は除外する
////    for (var i = events-1; i >= 0; i--) {
////      if(events[i].getStartTime() < startDate.getTime()){
////        events.splice(i, 1);
////      }
////    }
//
//    //終日フラグがTrueでない予定は除外する
//    for (var i = events.length-1; i >= 0; i--) {
//      if(events[i].isAllDayEvent() != true){
//        events.splice(i, 1);
//      }
//    }
//
//    message += "1ヵ月間の予定(終日のみ)は\n";
//    if(events.length > 0){
//      for (var i=0; i<events.length; i++){
//        message += Utilities.formatDate(events[i].getStartTime(),"GMT+0900","M/d(")
//        + wChars[events[i].getStartTime().getDay()]
//        + ") " 
//        + events[i].getTitle() 
//        + "\n";
//      }
//    }else{
//      message += "生きろ。\n";
//    }
//    
//    options.payload = "message=" + encodeURIComponent(message);
//    UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
//  } 
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
}
