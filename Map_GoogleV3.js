/***********************************************************************************
The functions listed below are related to Vehicle tracking Feature in Google V3 Maps.
***********************************************************************************/

var timerInterval;
var map = null;
var polyline = null;
var contextmenu;
var history_latlng = null;
var centerCoordinate = null;//new google.maps.LatLng(23.805450, 78.486328); //new GLatLng(23.805450, 78.486328);
var isViewLatLong = 0;
var mapItMarkers;
var content;
var MapView = new Array();
var MapViewFullScreen = Array();
var infowindow = null; //new google.maps.InfoWindow({ content: content });
var isEditable = false;
var isDraggable = false;
var MarkerImage = null;
var orgCenter = null;
var orgZoomLevel = null;
var resultContainer;
var markerCluster = null;
var isShowLandmarkPlotter = 0;
var isShowGeozonePlotter = false;
var circle;
var Rec_bounds;
var polyPoints = new Array();
var polyShape;


var PlayBack = {};
var playBackArray = new Array();
var busMarker;
var PlayBackZoom = new Array();
var playAlarm = new Array();
var PlaybackMarker = new Array();


// Legend Icons
var VAllLandmark = "All Landmark";
var VCurrLocation = "Curr. Location";
var VIgnitionOn = "Ignition On";
var VIgnitionOff = "Ignition Off";
var VMoving = "Others";
var VIdling = "Idling";
var VAlarms = "Alarms";
var VDetails = "Details";
var VOtherinfo = "Other Info";
var VDateTime = "Date & Time";
var VMessage = "Message";
var VAddress = "Address";
var VLegendAlign = "left";
var VLandmark = "Landmark";
var VSleep = "Sleep Mode";
var VOthers = "Moving";
var VLegendHeader = "Legends";
var VLegendToolTip = "click to show / hide legends";
var VDirection = "ltr";

//Playback Legends
var VStart = "Start";
var VDestination = "Destination";
var VVehicle = "Vehicle";
var VAlarm = "Alarms";
var VInfopanel = "Show Info Panel";
var VMarkers = "Show Markers";
var Caption_Play = "Play";
var Caption_Pause = "Pause";
var Caption_Reset = "Reset";
var Caption_Stop = "Stop";
var Caption_Fast = "Fast";
var Caption_Medium = "Medium";
var Caption_Slow = "Slow";

// Set the alert messages from the Resource File
function SetIconLegendText(AllLandmarkAlert, CurrLocationAlert, IgnitionOnAlert, IgnitionOffAlert, MovingAlert, IdlingAlert, AlarmsAlert, VDetailsTab, VOtherinfoTab, VDateTimeAlert, VMessageAlert, VAddressAlert, VLegendAlignAlert, VLandmarkAlert, VDirectionMessage, VSleepMessage, VOtherMessage, VLegendHdrMessage, VLegendToolTipMessage) {

    VAllLandmark = AllLandmarkAlert;
    VCurrLocation = CurrLocationAlert;
    VIgnitionOn = IgnitionOnAlert;
    VIgnitionOff = IgnitionOffAlert;
    VMoving = MovingAlert;
    VIdling = IdlingAlert;
    VAlarms = AlarmsAlert;
    VDetails = VDetailsTab;
    VOtherinfo = VOtherinfoTab;
    VDateTime = VDateTimeAlert;
    VMessage = VMessageAlert;
    VAddress = VAddressAlert;
    VLegendAlign = VLegendAlignAlert;
    VLandmark = VLandmarkAlert;
    VDirection = VDirectionMessage;
    VSleep = VSleepMessage;
    VOthers = VOtherMessage;
    VLegendHeader = VLegendHdrMessage;
    VLegendToolTip = VLegendToolTipMessage;

    try {
        document.getElementById("map-legend").innerHTML = iconLegendText();
    }
    catch (ex)
    { }
}


function SetPlayBackLegends(Startpoint, Destination, Vehicle, Alarm, InfoPanel, ShowMarkers) {
    VStart = Startpoint;
    VDestination = Destination;
    VVehicle = Vehicle;
    VAlarm = Alarm;
    VInfopanel = InfoPanel;
    VMarkers = ShowMarkers;

    try {
        document.getElementById("map-legend").innerHTML = PlaybackLegends();
    }
    catch (ex)
    { }
}


//Playback Captions.
function SetPlaybackCaptions(Play, Pause, Reset, Stop, Fast, Medium, Slow) {
    Caption_Play = Play;
    Caption_Pause = Pause;
    Caption_Reset = Reset;
    Caption_Stop = Stop;
    Caption_Fast = fast;
    Caption_Medium = Medium;
    Caption_Slow = Slow;
}

var VLandmarkLocationDetails = "Landmark Location Details";
var VOrgCoordinates = "Original Coordinates";
function SetLandMarkText(VLandmarkLocationDetailsMessage, VOrgCoordinatesMessage, VAddressMessage, VDirectionMessage) {
    VLandmarkLocationDetails = VLandmarkLocationDetailsMessage;
    VOrgCoordinates = VOrgCoordinatesMessage;
    VAddress = VAddressMessage;
    VDirection = VDirectionMessage;
}
function load() {
    try {
        isShowLandmarkPlotter = 0;
        isShowGeozonePlotter = false;
        document.getElementById("map-legend").innerHTML = iconLegendText();
        document.getElementById('chkLandmark').visible = false;
        //GUnload();
    }
    catch (Error) {
    }
    try {
        var gridViewControl = document.getElementById('gvData');
        if (gridViewControl == null) {
            gridViewControl = document.getElementById('gvHistory');
        }
        if (gridViewControl != null) {
            document.getElementById('map-dsply').style.width = gridViewControl.width; //document.body.clientWidth ;//document.documentElement.clientWidth-35//screen.width - 35;
        }
        if (location.pathname.indexOf("AdvancedHistoryPage.aspx") != -1 || location.pathname.indexOf("VehicleSummary.aspx") != -1) {
            document.getElementById('map-dsply').style.height = 600 + 'px';
            document.getElementById('grid-dsply').style.height = 600 + 'px';
        }
        else {
            if (document.body.clientHeight < 640)
                document.getElementById('map-dsply').style.height = (document.body.clientHeight) + 'px';
            if (document.body.clientHeight < 800)
                document.getElementById('map-dsply').style.height = (document.body.clientHeight / 1.5) + 'px';
            else
                document.getElementById('map-dsply').style.height = (document.body.clientHeight / 2) + 'px';
        }
        // document.getElementById('map-dsply').style.height = (document.body.clientHeight / 2) + 'px';

        //var MapZoomLevel = (orgZoomLevel != null ? orgZoomLevel : 4);
        map = new google.maps.Map(document.getElementById("map-dsply"),
            {//centerCoordinate,
                center: (orgCenter != null ? new google.maps.LatLng(parseFloat(orgCenter[0]), parseFloat(orgCenter[1])) : new google.maps.LatLng(23.805450, 78.486328)),     //centerCoordinate
                zoom: parseInt(orgZoomLevel != null ? orgZoomLevel : 4, 0),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                panControl: true,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL,
                    position: google.maps.ControlPosition.LEFT_CENTER
                },
                streetViewControl: false,
                fullscreenControl: false,
                //streetViewControlOptions: {
                //    position: google.maps.ControlPosition.LEFT_BOTTOM
                //},
                mapTypeControl: true,
                scaleControl: false,

                //                streetViewControl: true,
                overviewMapControl: true
            });
        infowindow = new google.maps.InfoWindow({ content: content });
        infowindow.setHeight = 500;

        google.maps.event.addListener(map, 'maptypechanged', mapTypeChanged);
        google.maps.event.addListener(map, 'click', function (evt) {
            if (infowindow) {
                infowindow.close();
            }
        });
        //google.maps.event.addListener(map, "rightclick", function (evt) { showlandmark(); });
        var menu = new contextMenu({ map: map });

        // Add some items to the menu
        menu.addItem('Show / Hide Landmark(s)', function (map, latLng) {
            //map.setZoom(map.getZoom() + 1);
            // map.panTo(latLng);
            if (isShowLandmarkPlotter == 0) {
                if (document.getElementById("hdnLandmarkEntries").value.length == 0) {
                    TrinetraCustomAlerts('No landmarks available to be plotted.');
                }
                else {
                    drawCircleForLandmark(document.getElementById("hdnLandmarkEntries").value, true);
                    //clusterDataPoints(clusterPoint, true);
                    isShowLandmarkPlotter = 1;
                }
                HidePopUp();
            }
            else if (isShowLandmarkPlotter == 1) {
                drawCircleForLandmark(document.getElementById("hdnLandmarkEntries").value, false);
                //clusterDataPoints(clusterPoint, false);
                isShowLandmarkPlotter = 0;
                HidePopUp();
            }

        });

        menu.addItem('Show / Hide Geozone(s)', function (map, latLng) {
            //map.setZoom(map.getZoom() - 1);
            //map.panTo(latLng);
            if (isShowGeozonePlotter == false) {
                PlotGeozone(true, 'M');
                isShowGeozonePlotter = true;
            }
            else {
                PlotGeozone(false, 'M');
                isShowGeozonePlotter = false;
            }
        });
        //menu.addSep();

        //menu.addItem('Center Here', function (map, latLng) {
        //    map.panTo(latLng);
        //});

        var mapTypeHolder = document.getElementById("hdnMapType");
        if (mapTypeHolder != null) {
            switch (mapTypeHolder.value) {
                case 'N': map.setMapTypeId(google.maps.MapTypeId.ROADMAP); break;
                case 'S': map.setMapTypeId(google.maps.MapTypeId.SATELLITE); break;
                case 'H': map.setMapTypeId(google.maps.MapTypeId.HYBRID); break;
                default: map.setMapTypeId(google.maps.MapTypeId.TERRAIN); break;
            }
        }
        orgCenter = null;
        orgZoomLevel = null;
        return true;
    }
    catch (Error) {
        return confirm('Please check your Internet Connection. Map cannot be loaded. Click Ok to proceed.');
    }
}

function iconLegendText() {
    var height = '';
    if (location.pathname.indexOf("AdvancedHistoryPage.aspx") != -1) {
        var landmarkIconText = "";
    }
    else {
        var landmarkIconText = "<h3 class='foot'><table><tr>" +
                          "  <td style='padding-left:2px;' align='right'><input type='checkbox' id='chkLandmark' style='height:15px;width:15px;' name='chkLandmark' onclick='ShowPopUp();document.getElementById(\"chkShowLandmarks\").checked = this.checked;if(this.checked){document.getElementById(\"chkLTooltip\").disabled = false;}else{document.getElementById(\"chkLTooltip\").checked=false;drawLabelForLandmark(document.getElementById(\"hdnLandmarkEntries\").value,false);document.getElementById(\"chkLTooltip\").disabled = true;};drawCircleForLandmark(document.getElementById(\"hdnLandmarkEntries\").value,this.checked);HidePopUp();'><span style='vertical-align:top;background-color:white;color:Blue'></td>" +
                          "  <td style='font:11px arial;color:#333333;vertical-align:middle' align='" + VLegendAlign + "'> All Landmark </span></td>" +
    "</tr><tr style='display:none;'>" +
                          "  <td style='padding-left:2px;' align='right'><input type='checkbox' id='chkLTooltip' style='height:15px;width:15px;' name='chkLTooltip' disabled='true' onclick='ShowPopUp();drawLabelForLandmark(document.getElementById(\"hdnLandmarkEntries\").value,this.checked);HidePopUp();'><span style='vertical-align:top;background-color:white;color:Blue'></td>" +
                          "  <td style='font:11px arial;color:#333333;vertical-align:middle' align='" + VLegendAlign + "'>Show Names</span></td>" +
    "</tr></table></h3>";
    }
    if (location.pathname.indexOf("AdvancedHistoryPage.aspx") != -1) {
        var landmarkIconTextForFullscreen = "";
    }
    else {
        var landmarkIconTextForFullscreen = "";
        //    var landmarkIconTextForFullscreen = "<h3 class='foot'><table><tr>" +
        //                      "  <td style='padding-left:2px;' align='right'><input type='checkbox' id='chkLandmark' style='height:15px;width:15px;' name='chkLandmark' onclick='ShowPopUp();if(this.checked){document.getElementById(\"chkLTooltip\").disabled = false;}else{document.getElementById(\"chkLTooltip\").disabled = true;document.getElementById(\"chkLTooltip\").checked=false;drawLabelForLandmark(document.getElementById(\"hdnLandmarkEntries\").value,false);};drawCircleForLandmark(document.getElementById(\"hdnLandmarkEntries\").value,this.checked);HidePopUp();'><span style='vertical-align:top;background-color:white;color:Blue'></td>" +
        //                      "  <td style='font:11px arial;color:#333333;vertical-align:middle' align='" + VLegendAlign + "'>All Landmark</span></td>" +
        //"</tr><tr style='display:none;'>" +
        //                      "  <td style='padding-left:2px;' align='right'><input type='checkbox' id='chkLTooltip' style='height:15px;width:15px;' name='chkLTooltip' disabled='true' onclick='ShowPopUp();drawLabelForLandmark(document.getElementById(\"hdnLandmarkEntries\").value,this.checked);HidePopUp();'><span style='vertical-align:top;background-color:white;color:Blue'></td>" +
        //                      "  <td style='font:11px arial;color:#333333;vertical-align:middle' align='" + VLegendAlign + "'>Show Names</span></td>" +
        //"</tr></table></h3>";
    }
    var CurrentPosistion = (document.getElementById('gvHistory') != null) ? "<tr>" +
                       "  <td style='padding-left:2px'><img src='../images/down.png' alt='current location' style='height:15px;width:15px'/></td>" +
                       "  <td align=" + VLegendAlign + "><span class='txt' id='spLocation' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VCurrLocation + "</span></td>" +
                       "</tr>" : '';

    //    var downIconText = (document.getElementById('gvHistory') != null) ? "<tr>" +
    //                       "  <td style='padding-left:2px'><img src='../images/down.png' alt='current location' style='height:15px;width:15px'/></td>" +
    //                       "  <td align=" + VLegendAlign + "><span class='txt' id='spLocation' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;Curr. Location </span></td>" +
    //                       "</tr>" + landmarkIconTextForFullscreen : (document.getElementById('gvData') != null) ? landmarkIconText : (document.getElementById('hdnLandmarkEntries') != null && document.getElementById('hdnLandmarkEntries').value.length != 0) ? landmarkIconTextForFullscreen : "";

    var downIconText = (document.getElementById('gvHistory') != null) ? landmarkIconTextForFullscreen : (document.getElementById('gvData') != null) ? landmarkIconText : (document.getElementById('hdnLandmarkEntries') != null && document.getElementById('hdnLandmarkEntries').value.length != 0) ? landmarkIconTextForFullscreen : "";

    //    downIconText += (document.getElementById('gvHistory') != null) ? "<h3 class='foot'><table><tr>" +
    //                          "  <td style='padding-left:2px;' align='right'><input type='checkbox' id='chkRoute' style='height:15px;width:15px;' name='chkRoute' onclick='DrawRoute(this);'><span style='vertical-align:top;background-color:white;color:Blue'></td>" +
    //                          "  <td style='font:11px arial;color:#333333;vertical-align:middle;' align='" + VLegendAlign + "'><b>" + VShowRoute + "</b></span></td>" +
    //                        "</tr></table></h3>" : "";


    //var legendText = "<a href='#' onclick='CollapseLegend(\"tblLegend\",this);return false;' style='text-decoration:none;'><div style='cursor:pointer;font:12px arial;color:#333333;vertical-align:middle;background-color:#F4F3F0;border:1px solid #979797;width:118px' align='center' id='lnkLegend'><b>Legends</b></div></a><table id='tblLegend' align='right' width='120px' " + height + " style='direction:" + VDirection + ";padding:2px 0px 2px 2px;background-color:#E8ECF8;border-left:1px solid #979797;border-top:1px solid #979797;border-bottom:1px solid #979797'>" +
    //    var legendText = "<div class='panel' align='center' id='lnkLegend'> <h2><b>" + VLegendHeader + "</b></h2><div class='panelcontent'><table id='tblLegend' align='right'" + height + " style='direction:" + VDirection + ";'>" +
    //    "<tr><td align='right' style='padding: 6px 0px 6px 6px;'>" +
    //                     "<table cellpadding='2' cellspacing='2' align='right' width='112px' height='114px' style='background-color:#F4F3F0;border-left:1px solid #979797;border-top:1px solid #979797;border-bottom:1px solid #979797'>" +
    //                     "<tr>" +
    //                     "  <td style='padding-left:2px'><img src='../images/purple-1_.png' alt='Ignition On' style='height:15px;width:15px' /></td>" +
    //                     "  <td align='" + VLegendAlign + "'><span class='txt' id='spIgnitionOn' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;Ignition On</span></td>" +
    //                     "</tr>" +
    //                     "<tr>" +
    //                     "  <td style='padding-left:2px'><img src='../images/orange-1_.png' alt='Ignition Off' style='height:15px;width:15px' /></td>" +
    //                     "  <td align='" + VLegendAlign + "'><span class='txt' id='spIgnitionOff' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;Ignition Off</span></td>" +
    //                     "</tr>" +
    //                     "<tr>" +
    //                     "  <td style='padding-left:2px'><img src='../images/1_.png' alt='Ignition On' style='height:15px;width:15px' /></td>" +
    //                     "  <td align='" + VLegendAlign + "'><span class='txt' id='spOther' runat='server' style='font:11px arial; color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;Others</span></td>" +
    //                     "</tr>" +
    //                     "<tr>" +
    //                     "  <td style='padding-left:2px'><img src='../images/pink-1_.png' alt='Idling' style='height:15px;width:15px' /></td>" +
    //                     "  <td align='" + VLegendAlign + "'><span class='txt'  id='spIdling' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;Idling</span></td>" +
    //                     "</tr>" +
    //                     "<tr>" +
    //                     "  <td style='padding-left:2px'><img src='../images/3.png' alt='moving' style='height:15px;width:15px' /></td>" +
    //                     "  <td align='" + VLegendAlign + "'><span class='txt' id='spMoving' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;Moving </span></td>" +
    //                     "</tr>" +
    //                     "<tr>" +
    //                     "  <td style='padding-left:2px'><img src='../images/mapit-9_.png' alt='sleep' style='height:15px;width:15px' /></td>" +
    //                     "  <td align='" + VLegendAlign + "'><span class='txt' id='spSleep' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;Sleep Mode</span></td>" +
    //                     "</tr>" +
    //                     "<tr>" +
    //                      "  <td style='padding-left:2px'><img src='../images/fuellow-1_.png' alt='Alarms' style='height:15px;width:15px' /></td>" +
    //                     "  <td align='" + VLegendAlign + "'><span class='txt' id='spAlarms' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VAlarms + "</span></td>" +
    //                     "</tr>" + CurrentPosistion + "</table></td></tr></table></div><b>" + downIconText + "</b></div>";

    //    //                     "  <td style='padding-left:2px'><img src='../images/fuellow-1_.png' alt='Alarms' style='height:15px;width:15px' /></td>" +
    //    //                     "  <td align='" + VLegendAlign + "'><span class='txt' id='spAlarms' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;Alarms</span></td>" +
    //    //                     "</tr>" + downIconText +
    //    //                     "</table>"
    //    //    "</td></tr></table>";
    //    return legendText;

    var legendText = "<div class='panel' align='center' id='lnkLegend'> <h2><b>" + VLegendHeader + "</b></h2><div class='panelcontent'><table id='tblLegend' align='right'" + height + " style='direction:" + VDirection + ";'>" +
                "<tr><td align='right' style='padding: 6px 0px 6px 6px;'>" +
                 "<table cellpadding='2' cellspacing='2' align='right' width='112px' " +
                 ((location.pathname.indexOf("FullscreenMap.aspx") != -1 && location.search.indexOf("?pMy9nEs9WLFPu5OGp76JWA==") != -1) ?
                 "height='20px'>" +
                 "<tr>" +
                 "  <td style='padding-left:2px'><img src='../images/fuellow-1_.png' alt='Alarms' style='height:15px;width:15px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spAlarms' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VAlarms + "</span></td>" +
                 "</tr>" + CurrentPosistion + "</table></td></tr></table>"
                 :
                 "height='114px'>" +
                 ((location.pathname.indexOf("HistoryPage.aspx") != -1 && location.pathname.indexOf("AdvancedHistoryPage.aspx") == -1) ?
                 "<tr>" +
                 "  <td style='padding-left:2px' align='center'><img src='../images/Start_point_legend.png' alt='Ignition On' style='height:15px;width:15px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spIgnitionOn' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VStart + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px' align='center'><img src='../images/End_point_legend.png' alt='Ignition Off' style='height:15px;width:15px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spIgnitionOff' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VDestination + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px'><img src='../images/car1_Mod.png' alt='Animate' style='height:15px;width:15px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spMoving' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;Playback Icon</span></td>" +
                 "</tr>" : "") +
                 "<tr>" +
                 "  <td style='padding-left:2px'><img src='../images/purple-1_.png' alt='Ignition On' style='height:15px;width:15px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spIgnitionOn' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VIgnitionOn + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px'><img src='../images/orange-1_.png' alt='Ignition Off' style='height:15px;width:15px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spIgnitionOff' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VIgnitionOff + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px'><img src='../images/1_.png' alt='Ignition On' style='height:15px;width:15px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spMoving' runat='server' style='font:11px arial; color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VMoving + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px'><img src='../images/pink-1_.png' alt='Idling' style='height:15px;width:15px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt'  id='spIdling' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VIdling + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px'><img src='../images/3.png' alt='moving' style='height:15px;width:15px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spMoving' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VOthers + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px'><img src='../images/mapit-9_.png' alt='sleep' style='height:15px;width:15px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spSleep' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VSleep + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px'><img src='../images/fuellow-1_.png' alt='Alarms' style='height:15px;width:15px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spAlarms' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VAlarms + "</span></td>" +
                 "</tr>" + CurrentPosistion + "</table></td></tr></table>") +
                 "</div><b>" + downIconText + "</b></div>";
    return legendText;
}

//Legends for Playback Feature
function PlaybackLegends() {
    var height = '';
    if (document.getElementById("playbackControls") != null) {
        document.getElementById("playbackControls").setAttribute("class", "ControlShow");
    }
    var InfoBubble = "<h3 class='foot'><table><tr>" +
                          "  <td style='padding-left:2px;' align='right'><input type='checkbox' id='chkInfoBubble' style='height:15px;width:15px;' name='chkInfoBubble' onclick='document.getElementById(\"chkInfoBubble\").checked = this.checked;'><span style='vertical-align:top;background-color:white;color:Blue'></td>" +
                          "  <td style='font:11px arial;color:#333333;vertical-align:middle;' align='" + VLegendAlign + "'><b>" + VInfopanel + "</b></span></td>" +
    "</tr></table></h3>";

    var ShowMarkers = "<h3 class='foot'><table><tr>" +
                          "  <td align='right'><input type='checkbox' id='chkShowMarker' style='height:15px;width:15px;margin-right:8px;' name='chkShowMarker' onclick='Addcontainer(this);'><span style='vertical-align:top;background-color:white;color:Blue'></td>" +
                          "  <td style='font:11px arial;color:#333333;vertical-align:middle;' align='" + VLegendAlign + "'><b>" + VMarkers + "</b></span></td>" +
                        "</tr></table></h3>"

    var legendText = "<div class='panel' align='center' id='lnkLegend'> <h2><b>" + VLegendHeader + "</b></h2><div class='panelcontent'><table id='tblLegend' align='right'" + height + " style='direction:" + VDirection + ";'>" +
                "<tr><td align='right' style='padding: 6px 0px 6px 6px;'>" +
                 "<table cellpadding='2' cellspacing='2' align='right' width='112px' height='114px'>" +
                 "<tr>" +
                 "  <td style='padding-left:2px' align='center'><img src='../images/Start_point_legend.png' alt='Ignition On' style='height:15px;width:15px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spIgnitionOn' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VStart + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px' align='center'><img src='../images/End_point_legend.png' alt='Ignition Off' style='height:15px;width:15px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spIgnitionOff' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VDestination + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px'><img src='../images/ignition-on_play.png' alt='Ignition On' style='height:20px;width:35px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spIgnitionOn' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VIgnitionOn + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px'><img src='../images/ignition-off_play.png' alt='Ignition Off' style='height:20px;width:35px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spIgnitionOff' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VIgnitionOff + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px'><img src='../images/car1_Mod.png' alt='Ignition On' style='height:20px;width:35px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spMoving' runat='server' style='font:11px arial; color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VMoving + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px'><img src='../images/Idling.png' alt='Idling' style='height:20px;width:35px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt'  id='spIdling' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VIdling + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px'><img src='../images/SleepMode.png' alt='sleep' style='height:20px;width:35px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt' id='spSleep' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VSleep + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px' align='center'><img src='../images/carmarker_Alarm.png' alt='Idling' style='height:20px;width:16px' /></td>" +
                 "  <td align='" + VLegendAlign + "'><span class='txt'  id='spIdling' runat='server' style='font:11px arial;color:#333333'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VAlarms + "</span></td>" +
                 "</tr>" +
                 "<tr>" +
                 "  <td style='padding-left:2px' align='center'><img src='../images/N.png' alt='moving' style='height:30px;width:20px' /></td>" +
                 "  <td align='" + VLegendAlign + "' style='vertical-align:middle;'><span class='txt' id='spMoving' runat='server' style='font:11px arial;color:#333333;'>&nbsp;&nbsp;-&nbsp;&nbsp;" + VOthers + "</span></td>" +
                 "</tr>" +
                 "</table></td></tr></table></div>" + InfoBubble + ShowMarkers + "</div>";
    return legendText;
}

//TO load Map in Full screen mode
function loadFullscreen() {
    try {
        document.getElementById("map-legend").innerHTML = document.getElementById("hdnAlarmIDs") == null ? PlaybackLegends() : iconLegendText();
    }
    catch (Error) {
    }
    try {
        var gridViewControl = document.getElementById('gvData');
        if (gridViewControl == null) {
            gridViewControl = document.getElementById('gvHistory');
        }
        if (gridViewControl != null) {
            document.getElementById('map-dsply').style.width = document.body.clientWidth; //document.documentElement.clientWidth-35//screen.width - 35;
        }
        document.getElementById('map-dsply').style.height = document.body.clientHeight + 'px';

        map = new google.maps.Map(document.getElementById("map-dsply"),
            {
                center: orgCenter != null ? new google.maps.LatLng(parseFloat(orgCenter[0]), parseFloat(orgCenter[1])) : new google.maps.LatLng(20.00, 78.00), //centerCoordinate,
                zoom: parseInt(orgZoomLevel != null ? orgZoomLevel : 4, 0), //4,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                panControl: true,
                zoomControl: true,
                //zoomControlOptions: { style: google.maps.ZoomControlStyle.LARGE },
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL,
                    position: google.maps.ControlPosition.LEFT_CENTER
                },
                streetViewControl: false,
                fullscreenControl: false,
                mapTypeControl: true,
                scaleControl: false,
                //                streetViewControl: true,
                overviewMapControl: true
            });

        infowindow = new google.maps.InfoWindow({ content: content });
        google.maps.event.addListener(map, 'maptypechanged', mapTypeChanged);
        var mapTypeHolder = document.getElementById("hdnMapType");
        if (mapTypeHolder != null) {
            switch (mapTypeHolder.value) {
                //                case 'N': map.setMapType(G_NORMAL_MAP); break;                                                                                                                                                                                                                                                                                          
                //                case 'S': map.setMapType(G_SATELLITE_MAP); break;                                                                                                                                                                                                                                                                                          
                //                case 'H': map.setMapType(G_HYBRID_MAP); break;                                                                                                                                                                                                                                                                                          

                case 'N': map.setMapTypeId(google.maps.MapTypeId.ROADMAP); break;
                case 'S': map.setMapTypeId(google.maps.MapTypeId.SATELLITE); break;
                case 'H': map.setMapTypeId(google.maps.MapTypeId.HYBRID); break;
                case 'T': map.setMapTypeId(google.maps.MapTypeId.TERRAIN); break;
                default: map.setMapTypeId(google.maps.MapTypeId.ROADMAP); break;
            }
        }
        //google.maps.event.addListener(map, "rightclick", function (evt) { showlandmark(); });
        var menuF = new contextMenu({ map: map });
        menuF.addItem('Show / Hide Landmark(s)', function (map, latLng) {
            //map.setZoom(map.getZoom() + 1);
            // map.panTo(latLng);
            if (isShowLandmarkPlotter == 0) {
                if (document.getElementById("hdnLandmarkEntries").value.length == 0) {
                    TrinetraCustomAlerts('No landmarks available to be plotted.');
                }
                else {
                    drawCircleForLandmark(document.getElementById("hdnLandmarkEntries").value, true);
                    //clusterDataPoints(clusterPoint, true);
                    isShowLandmarkPlotter = 1;
                }
                HidePopUp();
            }
            else if (isShowLandmarkPlotter == 1) {
                drawCircleForLandmark(document.getElementById("hdnLandmarkEntries").value, false);
                //clusterDataPoints(clusterPoint, false);
                isShowLandmarkPlotter = 0;
                HidePopUp();
            }

        });

        menuF.addItem('Show / Hide Geozone(s)', function (map, latLng) {
            //map.setZoom(map.getZoom() - 1);
            //map.panTo(latLng);
            if (isShowGeozonePlotter == false) {
                PlotGeozone(true, 'M');
                isShowGeozonePlotter = true;
            }
            else {
                PlotGeozone(false, 'M');
                isShowGeozonePlotter = false;
            }
        });

        orgCenter = null;
        orgZoomLevel = null;
        return true;
    }
    catch (Error) {
        return confirm('Please check your Internet Connection. Map cannot be loaded. Click Ok to proceed.');
    }
}

function mapTypeChanged() {
    var mapTypeHolder = document.getElementById("hdnMapType");
    if (mapTypeHolder != null) {
        switch (map.getCurrentMapType()) {
            case G_NORMAL_MAP: mapTypeHolder.value = 'N'; break;
            case G_SATELLITE_MAP: mapTypeHolder.value = 'S'; break;
            case G_HYBRID_MAP: mapTypeHolder.value = 'H'; break;

                //            case 'N': map.setMapTypeId(google.maps.MapTypeId.ROADMAP); break;                                                                                                                                                                                                                                                                                         
                //            case 'S': map.setMapTypeId(google.maps.MapTypeId.SATELLITE); break;                                                                                                                                                                                                                                                                                         
                //            case 'H': map.setMapTypeId(google.maps.MapTypeId.HYBRID); break;                                                                                                                                                                                                                                                                                         
                //            default: map.setMapTypeId(google.maps.MapTypeId.TERRAIN); break;                                                                                                                                                                                                                                                                                         
        }
    }
}

var flag = false;
//To toggle from Fullscreen Mode - Not used now, but kept for future reference
function changeSize() {
    if (flag == false) {
        document.getElementById('top-content').style.display = 'none';
        document.getElementById('updGrid').style.display = 'none';
        document.getElementById('map-dsply').style.width = document.body.clientWidth - 10;
        document.getElementById('map-dsply').style.height = document.body.clientHeight - 10;
    }
    else {
        document.getElementById('top-content').style.display = 'block';
        document.getElementById('updGrid').style.display = 'block';
        var gridViewControl = document.getElementById('gvData');
        if (gridViewControl == null) {
            gridViewControl = document.getElementById('gvHistory');
        }
        if (gridViewControl != null) {
            document.getElementById('map-dsply').style.width = gridViewControl.width; //document.body.clientWidth ;//document.documentElement.clientWidth-35//screen.width - 35;
        }
        document.getElementById('map-dsply').style.height = (document.body.clientHeight / 2) + 'px';
    }
    // Always change value of flag
    // from true to false or vice versa
    flag = !flag;
    // Always call checkResize()
    map.checkResize();
    map.setCenter();
}

var marker = null;
function loadForLandMark() {
    try {
        document.getElementById("pnlInfoWindow").style.display = "none";
    }
    catch (Error) {
    }
    try {
        var isIE = CheckBrowser();
        var hdnCanAddLandmarksControl = document.getElementById('hdnCanAddLandmarks');
        var gridViewControl = document.getElementById('gvData');
        if (hdnCanAddLandmarksControl.value == 'false') {
            document.getElementById('search-area').setAttribute(isIE ? 'className' : 'class', 'ControlHide');
            if (gridViewControl != null) {
                document.getElementById('map-dsply').style.width = gridViewControl.clientWidth + 'px';
            }
        }
        else {
            document.getElementById('search-area').setAttribute(isIE ? 'className' : 'class', "ControlShow");
            document.getElementById('map-dsply').style.width = (gridViewControl.clientWidth - 5 -
             (document.getElementById('search-box').clientWidth)) + 'px';
        }

        // Setting the height of the map
        //document.getElementById('map-dsply').style.height = (screen.height / 2) - 44;
        if (document.body.clientHeight < 875) {
            document.getElementById('map-dsply').style.height = ((875 / 2) - 18) + 'px';
            document.getElementById('search-box').style.height = document.getElementById('map-dsply').style.height;
        }
        else {
            document.getElementById('map-dsply').style.height = ((document.body.clientHeight / 2) - 18) + 'px';
            document.getElementById('search-box').style.height = document.getElementById('map-dsply').style.height;
        }
        map = new google.maps.Map(document.getElementById("map-dsply"),
            {
                center: orgCenter != null ? new google.maps.LatLng(parseFloat(orgCenter[0]), parseFloat(orgCenter[1])) : new google.maps.LatLng(23.805450, 78.486328), //centerCoordinate,
                zoom: parseInt(orgZoomLevel != null ? orgZoomLevel : 4, 0), //4,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                panControl: true,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE
                },
                mapTypeControl: true,
                scaleControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                //                streetViewControl: true,
                overviewMapControl: true
            });
        if (document.getElementById('hdnMapZoomLevelLatLong').value != "") {
            var zoomLevelLatLong = document.getElementById('hdnMapZoomLevelLatLong').value.split(',');
            centerCoordinate = new google.maps.LatLng(zoomLevelLatLong[0], zoomLevelLatLong[1]);
        }
        map.setCenter(centerCoordinate, 4)
        google.maps.event.addListener(map, "zoomend", function (oldLevel, newLevel) {
            document.getElementById('hdnMapZoomLevel').value = newLevel;
            centerCoordinate = map.getCenter();
            try {
                document.getElementById('hdnMapZoomLevelLatLong').value = centerCoordinate.y + ',' + centerCoordinate.x;
            }
            catch (Error) { }
        });

        //== Click on Map to get the co-ordinates
        google.maps.event.addListener(map, 'click', function (evt) {
            showControls(1);
            if (evt != null) {
                document.getElementById('txtlat').value = Math.round(evt.latLng.lat() * 1000000) / 1000000;
                document.getElementById('txtlong').value = Math.round(evt.latLng.lng() * 1000000) / 1000000;

                if (document.getElementById('hdnLatLong') != null) {
                    document.getElementById('hdnLatLong').value = evt.latLng.lat() + ',' + evt.latLng.lng();
                }
                chkValue = 0;

                document.getElementById('hdnIsLocateMe').value = 'N';
            }
        });
    }
    catch (Error) {
        alert('Please check your Internet Connection. Map cannot be loaded');
    }

    if (document.getElementById('hdnMapZoomLevel').value != "") {
        map.setZoom(eval(document.getElementById('hdnMapZoomLevel').value));
    }
}
//------End------Added by Ramya on 03 Oct 09 (To change the width of the map displaying div----------//
var lt;
var count = '';
//To get the array of LatLong values
var collectdata = null;

var lntlngs = new Array();
var geocoder;
var address = new Array();
var disArray = new Array();
var googleResults;
var lastvalue = null;
var positioncurrent = null;
var landmarkInfo = null;
var canClearCircle = true;
var historyLandmarks = ''

function DisplayLocation(latlng, pageName, mainCaption, isMessageVisbile, msgCaption, isDateTimeVisible, datetimeCaption,
    isAddressVisible, addressCaption, isLandmarkVisible, landmarkCaption, isSpeedVisible, speedCaption,
    addLandmarkCaption, isVehicleVisbile, vehicleCaption, isPolylineVisible, isCurrentPositionVisible) {


    try {
        //var mapItValueList = document.getElementById("hdnAlarmIDs").value.split(',');


        try {
            var mapItValueList = document.getElementById("hdnAlarmIDs") == null ? new Array() : document.getElementById("hdnAlarmIDs").value.split(',');
        }
        catch (ex) {
        }
        var Tripcount = 1;
        var mapTypeHolder = document.getElementById("hdnMapType");
        if (mapTypeHolder != null) {
            switch (mapTypeHolder.value) {
                case 'N': map.setMapTypeId(google.maps.MapTypeId.ROADMAP); break;
                case 'S': map.setMapTypeId(google.maps.MapTypeId.SATELLITE); break;
                case 'H': map.setMapTypeId(google.maps.MapTypeId.HYBRID); break;
                default: map.setMapTypeId(google.maps.MapTypeId.TERRAIN); break;
            }
        }
        lt = new Array();
        history_latlng = latlng;
        googleResults = new Array();
        lntlngs = new Array();
        lntlngTrip1 = new Array();
        lntlngTrip2 = new Array();
        lntlngTrip3 = new Array();
        lntlngTrip = new Array();
        collectdata = new google.maps.LatLngBounds();

        //Playback
        PlayBack = {};
        playBackArray = new Array();
        PlayBackZoom = new Array();
        playAlarm = new Array();
        PlaybackMarker = new Array();

        //markersContainer = new nokia.maps.map.Container();

        if (latlng.indexOf('~&~*') > 0) {
            var currentpos = latlng.split('~&~*');
            lt = currentpos[0].split('~&~');
            positioncurrent = currentpos[1];
        }
        else {
            lt = latlng.split('~&~*');
            positioncurrent = lt[1];

            if (positioncurrent != null) {
                var curpos = positioncurrent.split("~#~");
                collectdata.extend(new google.maps.LatLng(curpos[0], curpos[1]));
                var point = new google.maps.LatLng(curpos[0], curpos[1]);

                createMarker(point, curpos[5], curpos[3], curpos[4], 'current', i, curpos[2],
                     curpos[6], curpos[7], curpos[8], curpos[9], mainCaption, isMessageVisbile, msgCaption,
                     isDateTimeVisible, datetimeCaption, isAddressVisible, addressCaption, isLandmarkVisible,
                     landmarkCaption, isSpeedVisible, speedCaption, addLandmarkCaption).setMap(map);

                canClearCircle = false;
                map.fitBounds(collectdata);
                return;
            }
        }

        for (var i = 0; i < lt.length; i++) {
            var lng = new Array();
            lng = lt[i].split("~#~");
            if (i == lt.length - 1) {
                lastvalue = new google.maps.LatLng(lng[0], lng[1]);
            }
            if (location.pathname.indexOf("AdvancedHistoryPage.aspx") != -1) {
                if (lng[7] != 0) {
                    lntlngTrip.push(new google.maps.LatLng(lng[0], lng[1]));
                }
                else if (lng[7] == 0) {
                    if (lntlngTrip.length != 0) {
                        if (Tripcount == 1)
                            lntlngTrip1 = lntlngTrip;
                        else if (Tripcount == 2)
                            lntlngTrip2 = lntlngTrip;
                        else
                            lntlngTrip3 = lntlngTrip;
                        Tripcount++;
                        lntlngTrip = new Array();
                    }
                    lntlngTrip.push(new google.maps.LatLng(lng[0], lng[1]));
                }
            }
            lntlngs.push(new google.maps.LatLng(lng[0], lng[1]));
            collectdata.extend(new google.maps.LatLng(lng[0], lng[1]));
            PlayBackZoom.push(new google.maps.LatLng(lng[0], lng[1]));
            //playBackArray.push(lng[0]); playBackArray.push(lng[1]);
            playBackArray.push(new google.maps.LatLng(lng[0], lng[1]));
        }

        //create our new class
        var work = new threadedLoop(lntlngs);
        var mapMarker;
        work.action = function (item, index, total) {
            var lng = new Array();
            if (index <= total) {
                lng = lt[index - 1].split("~#~");
                mapMarker =
                    createMarker(lntlngs[index - 1], lng[5], lng[3], lng[4],
                    Array.contains(mapItValueList, "'" + lng[10].toString().toUpperCase() + "'") ?
                     'MapIt' : i.toString(), i, lng[2], lng[6], lng[7], lng[8], lng[9],
                     mainCaption, isMessageVisbile, msgCaption, isDateTimeVisible, datetimeCaption,
                     isAddressVisible, addressCaption, isLandmarkVisible, landmarkCaption,
                     isSpeedVisible, speedCaption, addLandmarkCaption);

                PlaybackMarker.push(mapMarker);
                if (document.getElementById("hdnAlarmIDs") != null) {
                    mapMarker.setMap(map);
                }
                mapMarker.setMap(map);

            }

        };
        work.finish = function (thread) {
            if (positioncurrent != null && isCurrentPositionVisible == 'true') {
                var curpos = positioncurrent.split("~#~");

                var point = new google.maps.LatLng(curpos[0], curpos[1]);
                createMarker(point, curpos[5], curpos[3], curpos[4], 'current', i, curpos[2],
                 curpos[6], curpos[7], curpos[8], curpos[9], mainCaption, isMessageVisbile, msgCaption,
                 isDateTimeVisible, datetimeCaption, isAddressVisible, addressCaption, isLandmarkVisible,
                 landmarkCaption, isSpeedVisible, speedCaption, addLandmarkCaption).setMap(map);

                canClearCircle = false;
                map.fitBounds(collectdata);

            }
            if (document.getElementById("hdnAlarmIDs") == null) {
                playBack(playBackArray);
            }
            work = null;
            HidePopUp();
        };
        work.start();
        if (isPolylineVisible) {
            if (location.pathname.indexOf("AdvancedHistoryPage.aspx") != -1) {
                polyline = new google.maps.Polyline({
                    path: lntlngTrip1,
                    //strokeColor: "#980900",
                    strokeColor: "#0B2161",
                    strokeOpacity: 0.8,
                    strokeWeight: 2
                });
                polyline.setMap(map);
                if (document.getElementById('lblTrip1') != undefined) {
                    document.getElementById('lblTrip1').style.backgroundColor = "#0B2161";
                    document.getElementById('lblTrip1').style.color = "#FBEFEF";
                }
                if (lntlngTrip2.length >= 0) {
                    polyline = new google.maps.Polyline({
                        path: lntlngTrip2,
                        //strokeColor: "#980900",
                        strokeColor: "#FF0000",
                        strokeOpacity: 0.8,
                        strokeWeight: 2
                    });
                    polyline.setMap(map);
                    if (document.getElementById('lblTrip2') != undefined) {
                        document.getElementById('lblTrip2').style.backgroundColor = "#FF0000";
                        document.getElementById('lblTrip2').style.color = "#FBEFEF";
                    }
                }
                if (lntlngTrip3.length >= 0) {
                    polyline = new google.maps.Polyline({
                        path: lntlngTrip3,
                        //strokeColor: "#980900",
                        strokeColor: "#2ECCFA",
                        strokeOpacity: 0.8,
                        strokeWeight: 2
                    });
                    polyline.setMap(map);
                    if (document.getElementById('lblTrip3') != undefined) {
                        document.getElementById('lblTrip3').style.backgroundColor = "#2ECCFA";
                        document.getElementById('lblTrip3').style.color = "#0A0A2A";
                    }
                }

            }
            else {
                polyline = new google.maps.Polyline({
                    path: lntlngs,
                    strokeColor: "#980900",
                    strokeOpacity: 0.8,
                    strokeWeight: 2
                });
                polyline.setMap(map);
            }
        }
        else {
            polyline = new google.maps.Polyline({
                path: lntlngs,
                strokeColor: "#980900",
                strokeOpacity: 0.8,
                strokeWeight: 2
            });
            polyline.setMap(map);

        }
        map.fitBounds(collectdata);

        if (location.pathname.indexOf("HistoryPage.aspx") != -1) {
            google.maps.event.addListenerOnce(map, 'tilesloaded', function () {
                capture();
            });

        }


    }
    catch (Error) {
    }

}
function drawRoute(isChecked, type) { }
function continueOperations(isPolylineVisible, polyline, collectdata) {
    if (isPolylineVisible) {
        polyline = new BDCCPolyline(lntlngs, "#980900", 2, 0.8, "Polyline", 'dash');
        map.addOverlay(polyline);
    }
    map.setCenter(collectdata.getCenter(), map.getBoundsZoomLevel(collectdata) - 1);
}

// Creates a marker at the given point with the given number label
function Draw(polystyle) {
    try {
        var ctrl = document.getElementById(polystyle);

        if (ctrl.id == 'dot') {
            var solid = document.getElementById('solid');
            var dash = document.getElementById('dash');
            ctrl.src = '../images/btn-' + polystyle + '-over.jpg';
            solid.src = '../images/btn-solid.jpg';
            dash.src = '../images/btn-dash.jpg';
        }
            //Dash
        else if (ctrl.id == 'dash') {
            var solid = document.getElementById('solid');
            var dot = document.getElementById('dot');
            ctrl.src = '../images/btn-' + polystyle + '-over.jpg';
            solid.src = '../images/btn-solid.jpg';
            dot.src = '../images/btn-dot.jpg';
        }
            //Solid
        else if (ctrl.id == 'solid') {
            var dash = document.getElementById('dash');
            var dot = document.getElementById('dot');
            ctrl.src = '../images/btn-' + polystyle + '-over.jpg';
            dot.src = '../images/btn-dot.jpg';
            dash.src = '../images/btn-dash.jpg';
        }

        if (lntlngs.length > 0) {
            map.removeOverlay(polyline);
        }
    }
    catch (Error) {
        //    return confirm('Please check your Internet Connection. Map cannot be loaded. Click Ok to proceed.');
    }
}
var timeoutMarker;
function createMarker(point, heading, speed, time, id, i_No, addr, dist, ignstatus, landmark, msgdetails,
    mainCaption, isMessageVisbile, msgCaption, isDateTimeVisible, datetimeCaption, isAddressVisible,
    addressCaption, isLandmarkVisible, landmarkCaption, isSpeedVisible, speedCaption, addLandmarkCaption) {
    var mapIcon = null;
    //debugger;
    var marker;
    try {
        if (heading == -1 && id != 'current') {
            if (id == 'MapIt') {
                mapIcon = '../images/mapit-1_.png';
                playbackIcon = '../images/vechile_New.png';
            }
            else if (ignstatus == '1') {
                mapIcon = '../images/purple-1_.png';
                playbackIcon = '../images/ignition-on_play.png';
            }
            else if (ignstatus == '6' || ignstatus == '7') {
                mapIcon = '../images/fuellow-1_.png';
                playbackIcon = '../images/carmarker_Alarm.png';
            }
            else if (ignstatus == '3' || ignstatus == '8' || ignstatus == '9') /*Idling start & end 06-Dec-2011 - Sakthi*/ {
                mapIcon = '../images/pink-1_.png';
                playbackIcon = '../images/Idling.png';
            }
            else if (ignstatus == '4') {
                mapIcon = '../images/fuelnormal-1_.png';
                playbackIcon = mapIcon;
            }
            else if (ignstatus == '5') {
                mapIcon = '../images/fuelhigh-1_.png';
                playbackIcon = mapIcon;
            }
            else if (ignstatus == '2') {
                mapIcon = '../images/1_.png';
                playbackIcon = '../images/car1_Mod.png';
            }
            else if (ignstatus == '0') {
                mapIcon = '../images/orange-1_.png';
                playbackIcon = '../images/ignition-off_play.png';
            }
            else if (ignstatus == '10') { /*Sleep mode 20-Dec-2011 Sakthi*/
                mapIcon = '../images/mapit-9_.png';
                playbackIcon = '../images/SleepMode.png';
            }
        }
        else if (heading >= 0 && heading <= 30 && id != 'current') {
            if (id == 'MapIt') {
                if (heading == '0' && ignstatus == '7') {
                    mapIcon = '../images/mapit-1_.png';
                    playbackIcon = '../images/vechile_New.png';
                }
                else {
                    mapIcon = '../images/mapit-3_20.png';
                    playbackIcon = '../images/N.png';
                }

            }
            else if (heading == '0' && ignstatus == '7') {
                mapIcon = '../images/fuellow-1_.png';
                playbackIcon = '../images/vechile_New.png';
            }
            else if (ignstatus == '6' || ignstatus == '7') {
                mapIcon = '../images/fuellow-3_20.png';
                playbackIcon = '../images/N.png';
            }
            else if (ignstatus == '3') {
                mapIcon = '../images/pink-3_20.png';
                playbackIcon = '../images/N.png';
            }
            else if (ignstatus == '4') {
                mapIcon = '../images/fuelnormal-3_20.png';
                playbackIcon = '../images/N.png';
            }
            else if (ignstatus == '5') {
                mapIcon = '../images/fuelhigh-3_20.png';
                playbackIcon = '../images/N.png';
            }
            else if (ignstatus == '2') {
                mapIcon = '../images/3_20.png';
                playbackIcon = '../images/N.png';
            }
            else if (ignstatus == '0') {
                mapIcon = '../images/orange-3_20.png';
                playbackIcon = '../images/N.png';
            }
            else if (ignstatus == '1') {
                mapIcon = '../images/purple-3_20.png';
                playbackIcon = '../images/N.png';
            }
        }
        else if (heading > 30 && heading <= 70 && id != 'current') {
            if (id == 'MapIt') {
                mapIcon = '../images/mapit-7_20.png';
                playbackIcon = '../images/NE.png';
            }
            else if (ignstatus == '6' || ignstatus == '7') {
                mapIcon = '../images/fuellow-7_20.png';
                playbackIcon = '../images/NE.png';
            }
            else if (ignstatus == '3') {
                mapIcon = '../images/pink-7_20.png';
                playbackIcon = '../images/NE.png';
            }
            else if (ignstatus == '4') {
                mapIcon = '../images/fuelnormal-7_20.png';
                playbackIcon = '../images/NE.png';
            }
            else if (ignstatus == '5') {
                mapIcon = '../images/fuelhigh-7_20.png';
                playbackIcon = '../images/NE.png';
            }
            else if (ignstatus == '2') {
                mapIcon = '../images/7_20.png';
                playbackIcon = '../images/NE.png';
            }
            else if (ignstatus == '0') {
                mapIcon = '../images/orange-7_20.png';
                playbackIcon = '../images/NE.png';
            }
            else if (ignstatus == '1') {
                mapIcon = '../images/purple-7_20.png';
                playbackIcon = '../images/NE.png';
            }
        }
        else if (heading > 70 && heading <= 100 && id != 'current') {
            if (id == 'MapIt') {
                mapIcon = '../images/mapit-1_20.png';
                playbackIcon = '../images/E.png';
            }
            else if (ignstatus == '6' || ignstatus == '7') {
                mapIcon = '../images/fuellow-1_20.png';
                playbackIcon = '../images/E.png';
            }
            else if (ignstatus == '3') {
                mapIcon = '../images/pink-1_20.png';
                playbackIcon = '../images/E.png';
            }
            else if (ignstatus == '4') {
                mapIcon = '../images/fuelnormal-1_20.png';
                playbackIcon = '../images/E.png';
            }
            else if (ignstatus == '5') {
                mapIcon = '../images/fuelhigh-1_20.png';
                playbackIcon = '../images/E.png';
            }
            else if (ignstatus == '2') {
                mapIcon = '../images/1_20.png';
                playbackIcon = '../images/E.png';
            }
            else if (ignstatus == '0') {
                mapIcon = '../images/orange-1_20.png';
                playbackIcon = '../images/E.png';
            }
            else if (ignstatus == '1') {
                mapIcon = '../images/purple-1_20.png';
                playbackIcon = '../images/E.png';
            }
        }
        else if (heading > 100 && heading <= 150 && id != 'current') {
            if (id == 'MapIt') {
                mapIcon = '../images/mapit-5_20.png';
                playbackIcon = '../images/SE.png';
            }
            else if (ignstatus == '6' || ignstatus == '7') {
                mapIcon = '../images/fuellow-5_20.png';
                playbackIcon = '../images/SE.png';
            }
            else if (ignstatus == '3') {
                mapIcon = '../images/pink-5_20.png';
                playbackIcon = '../images/SE.png';
            }
            else if (ignstatus == '4') {
                mapIcon = '../images/fuelnormal-5_20.png';
                playbackIcon = '../images/SE.png';
            }
            else if (ignstatus == '5') {
                mapIcon = '../images/fuelhigh-5_20.png';
                playbackIcon = '../images/SE.png';
            }
            else if (ignstatus == '2') {
                mapIcon = '../images/5_20.png';
                playbackIcon = '../images/SE.png';
            }
            else if (ignstatus == '0') {
                mapIcon = '../images/orange-5_20.png';
                playbackIcon = '../images/SE.png';
            }
            else if (ignstatus == '1') {
                mapIcon = '../images/purple-5_20.png';
                playbackIcon = '../images/SE.png';
            }
        }
        else if (heading > 150 && heading <= 200 && id != 'current') {
            if (id == 'MapIt') {
                mapIcon = '../images/mapit-4_20.png';
                playbackIcon = '../images/S.png';
            }
            else if (ignstatus == '6' || ignstatus == '7') {
                mapIcon = '../images/fuellow-4_20.png';
                playbackIcon = '../images/S.png';
            }
            else if (ignstatus == '3') {
                mapIcon = '../images/pink-4_20.png';
                playbackIcon = '../images/S.png';
            }
            else if (ignstatus == '4') {
                mapIcon = '../images/fuelnormal-4_20.png';
                playbackIcon = '../images/S.png';
            }
            else if (ignstatus == '5') {
                mapIcon = '../images/fuelhigh-4_20.png';
                playbackIcon = '../images/S.png';
            }
            else if (ignstatus == '2') {
                mapIcon = '../images/4_20.png';
                playbackIcon = '../images/S.png';
            }
            else if (ignstatus == '0') {
                mapIcon = '../images/orange-4_20.png';
                playbackIcon = '../images/S.png';
            }
            else if (ignstatus == '1') {
                mapIcon = '../images/purple-4_20.png';
                playbackIcon = '../images/S.png';
            }
        }
        else if (heading > 200 && heading <= 240 && id != 'current') {
            if (id == 'MapIt') {
                mapIcon = '../images/mapit-8_20.png';
                playbackIcon = '../images/SW.png';
            }
            else if (ignstatus == '6' || ignstatus == '7') {
                mapIcon = '../images/fuellow-8_20.png';
                playbackIcon = '../images/SW.png';
            }
            else if (ignstatus == '3') {
                mapIcon = '../images/pink-8_20.png';
                playbackIcon = '../images/SW.png';
            }
            else if (ignstatus == '4') {
                mapIcon = '../images/fuelnormal-8_20.png';
                playbackIcon = '../images/SW.png';
            }
            else if (ignstatus == '5') {
                mapIcon = '../images/fuelhigh-8_20.png';
                playbackIcon = '../images/SW.png';
            }
            else if (ignstatus == '2') {
                mapIcon = '../images/8_20.png';
                playbackIcon = '../images/SW.png';
            }
            else if (ignstatus == '0') {
                mapIcon = '../images/orange-8_20.png';
                playbackIcon = '../images/SW.png';
            }
            else if (ignstatus == '1') {
                mapIcon = '../images/purple-8_20.png';
                playbackIcon = '../images/SW.png';
            }
        }
        else if (heading > 240 && heading <= 280 && id != 'current') {
            if (id == 'MapIt') {
                mapIcon = '../images/mapit-2_20.png';
                playbackIcon = '../images/W.png';
            }
            else if (ignstatus == '6' || ignstatus == '7') {
                mapIcon = '../images/fuellow-2_20.png';
                playbackIcon = '../images/W.png';
            }
            else if (ignstatus == '3') {
                mapIcon = '../images/pink-2_20.png';
                playbackIcon = '../images/W.png';
            }
            else if (ignstatus == '4') {
                mapIcon = '../images/fuelnormal-2_20.png';
                playbackIcon = '../images/W.png';
            }
            else if (ignstatus == '5') {
                mapIcon = '../images/fuelhigh-2_20.png';
                playbackIcon = '../images/W.png';
            }
            else if (ignstatus == '2') {
                mapIcon = '../images/2_20.png';
                playbackIcon = '../images/W.png';
            }
            else if (ignstatus == '0') {
                mapIcon = '../images/orange-2_20.png';
                playbackIcon = '../images/W.png';
            }
            else if (ignstatus == '1') {
                mapIcon = '../images/purple-2_20.png';
                playbackIcon = '../images/W.png';
            }
        }
        else if (heading > 280 && heading <= 330 && id != 'current') {
            if (id == 'MapIt') {
                mapIcon = '../images/mapit-6_20.png';
                playbackIcon = '../images/NW.png';
            }
            else if (ignstatus == '6' || ignstatus == '7') {
                mapIcon = '../images/fuellow-6_20.png';
                playbackIcon = '../images/NW.png';
            }
            else if (ignstatus == '3') {
                mapIcon = '../images/pink-6_20.png';
                playbackIcon = '../images/NW.png';
            }
            else if (ignstatus == '4') {
                mapIcon = '../images/fuelnormal-6_20.png';
                playbackIcon = '../images/NW.png';
            }
            else if (ignstatus == '5') {
                mapIcon = '../images/fuelhigh-6_20.png';
                playbackIcon = '../images/NW.png';
            }
            else if (ignstatus == '2') {
                mapIcon = '../images/6_20.png';
                playbackIcon = '../images/NW.png';
            }
            else if (ignstatus == '0') {
                mapIcon = '../images/orange-6_20.png';
                playbackIcon = '../images/NW.png';
            }
            else if (ignstatus == '1') {
                mapIcon = '../images/purple-6_20.png';
                playbackIcon = '../images/NW.png';
            }
        }
        else if (heading > 330 && heading <= 360 && id != 'current') {
            if (id == 'MapIt') {
                mapIcon = '../images/mapit-3_20.png';
                playbackIcon = '../images/N.png';
            }
            else if (ignstatus == '6' || ignstatus == '7') {
                mapIcon = '../images/fuellow-3_20.png';
                playbackIcon = '../images/N.png';
            }
            else if (ignstatus == '3') {
                mapIcon = '../images/pink-3_20.png';
                playbackIcon = '../images/N.png';
            }
            else if (ignstatus == '4') {
                mapIcon = '../images/fuelnormal-3_20.png';
                playbackIcon = '../images/N.png';
            }
            else if (ignstatus == '5') {
                mapIcon = '../images/fuelhigh-3_20.png';
                playbackIcon = '../images/N.png';
            }
            else if (ignstatus == '2') {
                mapIcon = '../images/3_20.png';
                playbackIcon = '../images/N.png';
            }
            else if (ignstatus == '0') {
                mapIcon = '../images/orange-3_20.png';
                playbackIcon = '../images/N.png';
            }
            else if (ignstatus == '1') {
                mapIcon = '../images/purple-3_20.png';
                playbackIcon = '../images/N.png';
            }
        }
        else if (heading > 370 && id != 'current') {
            mapIcon = '../images/greendot_16.gif';
        }
        else {
            mapIcon = '../images/1.png';
        }


        if (id == 'current') {
            mapIcon = '../images/down.png';
        }
        if (mapIcon == null || mapIcon == '') {
            mapIcon = '../images/1.png';
        }

        if (id == 'current') {
            mapIcon = new google.maps.MarkerImage(mapIcon,
                new google.maps.Size(32, 32),
                new google.maps.Point(0, 0),
                new google.maps.Point(16, 32));
        }
        else {
            mapIcon = new google.maps.MarkerImage(mapIcon,
                new google.maps.Size(20, 20),
                new google.maps.Point(0, 0),
                new google.maps.Point(10, 10));
        }

        if (id == 'MapIt' || id == 'current') {
            marker = new google.maps.Marker({
                position: point,
                icon: mapIcon,
                draggable: false,
                zIndex: 28800001
            });
        }
        else {
            marker = new google.maps.Marker({
                position: point,
                icon: mapIcon,
                draggable: false
            });
        }

        var temp1 = "'" + point + "'";
        var temp = temp1.substring(2, temp1.length - 2);
        temp = "'" + temp + "'";
        var infoBubbleMessage = (!isSpeedVisible ? FrameMessage(mainCaption, isMessageVisbile, msgCaption, msgdetails,
        isDateTimeVisible, datetimeCaption, time, isAddressVisible, addressCaption, addr, isLandmarkVisible,
        landmarkCaption, landmark, isSpeedVisible, speedCaption, speed, addLandmarkCaption,
        (document.getElementById('hdnAddLandmark').value == "No" || landmark != "-") ? false : true, temp) : '');

        var tabs = (isSpeedVisible ? CreateTabs(mainCaption, isMessageVisbile, msgCaption, msgdetails,
        isDateTimeVisible, datetimeCaption, time, isAddressVisible, addressCaption, addr, isLandmarkVisible,
        landmarkCaption, landmark, isSpeedVisible, speedCaption, speed, addLandmarkCaption,
        (document.getElementById('hdnAddLandmark').value == "No" || landmark != "-") ? false : true, temp) : null);


        var playBackInfo = isSpeedVisible == true ? tabs : infoBubbleMessage;

        if (ignstatus == '6' || ignstatus == '7') {
            PlayBack[point.lat() + ',' + point.lng()] = { Info: playBackInfo, Alarm: true, icon: playbackIcon };
        }
        else {
            PlayBack[point.lat() + ',' + point.lng()] = { Info: playBackInfo, Alarm: false, icon: playbackIcon };
        }


        // Add tabs to the InfowWindow
        if (isSpeedVisible) {
            google.maps.event.addListener(marker, 'mouseover', function () {
                if (infowindow) {
                    infowindow.close();
                }
                infowindow.setContent(tabs);
                infowindow.open(map, marker);
            });
        }
        else {
            google.maps.event.addListener(marker, 'mouseover', function (marker) {
                if (infowindow) {
                    infowindow.close();
                }
                infowindow.setContent(infoBubbleMessage);
                infowindow.open(map, marker);
            });
        }
    }
    catch (Error) {
    }
    return marker;
}

function CreateTabs(mainCaption, isMessageVisbile, msgCaption, msgdetails, isDateTimeVisible, datetimeCaption,
time, isAddressVisible, addressCaption, address, isLandmarkVisible, landmarkCaption, landmarkName, isSpeedVisible,
 speedCaption, speed, addLandmarkCaption, canAddLandmark, temp) {
    var tabs = [];
    var tableAlign;
    if (VDirection == 'rtl') {
        tableAlign = 'right';
    }
    else {
        tableAlign = 'left';
    }
    var tabMessage = '<div style="text-align:' + tableAlign + ';"><table style="direction:' + VDirection + ';" cellpadding=\'5\' class=\'InfoBubble\' cellspacing=\'5\'>'; //<tr><td colspan="2"><u><b>' + mainCaption

    if (isMessageVisbile) {
        tabMessage += '<tr><td width="45px">' + '<b>' + msgCaption + '</b></td><td>' + msgdetails
            + '</td></tr>';
    }
    if (isDateTimeVisible) {
        tabMessage += '<tr><td width="60px" ><b>' + datetimeCaption + '</b></td><td class="DateStyle">' + time + '</td></tr>';
    }
    if (isAddressVisible) {
        tabMessage += '<tr><td><b>' + addressCaption + '</b></td><td>' + address + '</td></tr>';
    }


    if (isSpeedVisible) {
        tabMessage += '<tr><td><b>' + speedCaption + '</b></td><td>' + speed + '</td></tr>';
    }
    if (isLandmarkVisible) {
        tabMessage += '<tr><td width="40px"><b>' + landmarkCaption + '</b></td><td>' + landmarkName + '</td></tr>';
    }
    if (canAddLandmark) {
        tabMessage += '<tr><td colspan="2"><a href="javascript:getlngs(' + temp + ',\'' + address + '\');' +
        'document.getElementById(\'txtLocationName\').focus();">' + addLandmarkCaption + '<\/a></td></tr></table><div>';
    }
    tabMessage += '</table></div>';

    tabs = tabMessage;
    return tabs;
}
function BreakTime(marker) {
    marker.openInfoWindowHtml('infoBubbleMessage');
}

function FrameMessage(mainCaption, isMessageVisbile, msgCaption, msgdetails, isDateTimeVisible, datetimeCaption,
time, isAddressVisible, addressCaption, address, isLandmarkVisible, landmarkCaption, landmarkName, isSpeedVisible,
 speedCaption, speed, addLandmarkCaption, canAddLandmark, temp) {
    var bubbleMessage = '<table style="direction:' + VDirection + '" cellpadding=\'5\' class=\'InfoBubble\' cellspacing=\'5\'><tr><td colspan="2"><u><b>' + mainCaption
        + '</b></u></td></tr>';
    if (isMessageVisbile) {
        bubbleMessage += '<tr><td width="25px">' + '<b>' + msgCaption + '</b></td><td>' + msgdetails
    + '</td></tr>';
    }
    if (isDateTimeVisible) {
        bubbleMessage += '<tr><td><b>' + datetimeCaption + '</b></td><td>' + time + '</td></tr>';
    }
    if (isAddressVisible) {
        bubbleMessage += '<tr><td><b>' + addressCaption + '</b></td><td>' + address + '</td></tr>';
    }
    if (isLandmarkVisible) {
        bubbleMessage += '<tr><td width="40px"><b>' + landmarkCaption + '</b></td><td>' + landmarkName + '</td></tr>';
    }
    if (isSpeedVisible) {
        bubbleMessage += '<tr><td><b>' + speedCaption + '</b></td><td>' + speed + '</td></tr>';
    }
    if (canAddLandmark) {
        bubbleMessage += '<tr><td colspan="2"><a href="javascript:getlngs(' + temp + ',\'' + address + '\');' +
        'document.getElementById(\'txtLocationName\').focus();">' + addLandmarkCaption + '<\/a></td></tr>';
    }
    bubbleMessage += '</table>';
    return bubbleMessage
}

function MapIT_Marker(point, heading, speed, VehName, id, i_No, addr, dist, msgDetails, mainHeading, isVehicleVisbile, vehCaption, isMessageVisbile, msgCaption, isAddressVisbile, addrCaption, isSpeedVisbile, speedCaption,
                        isLandmarkVisible, landmarkCaption, landmarkName, canAddLandmark, isDriverNameVisible, driverNameCaption, driverName, driverPhoto, driverPhno, PhnoCaption) {


    var temp1 = "'" + point + "'";
    var temp = temp1.substring(2, temp1.length - 2);
    temp = "'" + temp + "'";

    var icon = null;

    if (heading == -1) {
        if (id == '6' || id == '7') {
            icon = '../images/fuellow-1_.png';
        }
        else if (id == '0') {
            icon = '../images/orange-1_.png';
        }
        else if (id == '1') {
            icon = '../images/purple-1_.png';
        }
        else if (id == '3' || id == '8' || id == '9') /*Idling start & end 06-Dec-2011 - Sakthi*/ {
            icon = '../images/pink-1_.png';
        }
        else if (id == '4') {
            icon = '../images/fuelnormal-1_.png';
        }
        else if (id == '5') {
            icon = '../images/fuelhigh-1_.png';
        }
        else if (id == '10') {
            icon = '../images/mapit-9_.png'; /*Sleep mode - 20-Dec-2011 Sakthi*/
        }
        else {
            icon = '../images/1_.png';
        }
    }
    else if (heading >= 0 && heading <= 30) {
        if (id == '6' || id == '7') {
            icon = '../images/fuellow-3_20.png';
        }
        else if (id == '3') {
            icon = '../images/pink-3_20.png';
        }
        else if (id == '4') {
            icon = '../images/fuelnormal-3_20.png';
        }
        else if (id == '5') {
            icon = '../images/fuelhigh-3_20.png';
        }
        else {
            icon = '../images/3_20.png';
        }
    }
    else if (heading > 30 && heading <= 70) {
        if (id == '6' || id == '7') {
            icon = '../images/fuellow-7_20.png';
        }
        else if (id == '3') {
            icon = '../images/pink-7_20.png';
        }
        else if (id == '4') {
            icon = '../images/fuelnormal-7_20.png';
        }
        else if (id == '5') {
            icon = '../images/fuelhigh-7_20.png';
        }
        else {
            icon = '../images/7_20.png';
        }
    }
    else if (heading > 70 && heading <= 100) {
        if (id == '6' || id == '7') {
            icon = '../images/fuellow-1_20.png';
        }
        else if (id == '3') {
            icon = '../images/pink-1_20.png';
        }
        else if (id == '4') {
            icon = '../images/fuelnormal-1_20.png';
        }
        else if (id == '5') {
            icon = '../images/fuelhigh-1_20.png';
        }
        else {
            icon = '../images/1_20.png';
        }
    }
    else if (heading > 100 && heading <= 150) {
        if (id == '6' || id == '7') {
            icon = '../images/fuellow-5_20.png';
        }
        else if (id == '3') {
            icon = '../images/pink-5_20.png';
        }
        else if (id == '4') {
            icon = '../images/fuelnormal-5_20.png';
        }
        else if (id == '5') {
            icon = '../images/fuelhigh-5_20.png';
        }
        else {
            icon = '../images/5_20.png';
        }
    }
    else if (heading > 150 && heading <= 200) {
        if (id == '6' || id == '7') {
            icon = '../images/fuellow-4_20.png';
        }
        else if (id == '3') {
            icon = '../images/pink-4_20.png';
        }
        else if (id == '4') {
            icon = '../images/fuelnormal-4_20.png';
        }
        else if (id == '5') {
            icon = '../images/fuelhigh-4_20.png';
        }
        else {
            icon = '../images/4_20.png';
        }
    }
    else if (heading > 200 && heading <= 240) {
        if (id == '6' || id == '7') {
            icon = '../images/fuellow-8_20.png';
        }
        else if (id == '3') {
            icon = '../images/pink-8_20.png';
        }
        else if (id == '4') {
            icon = '../images/fuelnormal-8_20.png';
        }
        else if (id == '5') {
            icon = '../images/fuelhigh-8_20.png';
        }
        else {
            icon = '../images/8_20.png';
        }
    }
    else if (heading > 240 && heading <= 280) {
        if (id == '6' || id == '7') {
            icon = '../images/fuellow-2_20.png';
        }
        else if (id == '3') {
            icon = '../images/pink-2_20.png';
        }
        else if (id == '4') {
            icon = '../images/fuelnormal-2_20.png';
        }
        else if (id == '5') {
            icon = '../images/fuelhigh-2_20.png';
        }
        else {
            icon = '../images/2_20.png';
        }
    }
    else if (heading > 280 && heading <= 330) {
        if (id == '6' || id == '7') {
            icon = '../images/fuellow-6_20.png';
        }
        else if (id == '3') {
            icon = '../images/pink-6_20.png';
        }
        else if (id == '4') {
            icon = '../images/fuelnormal-6_20.png';
        }
        else if (id == '5') {
            icon = '../images/fuelhigh-6_20.png';
        }
        else {
            icon = '../images/6_20.png';
        }
    }
    else if (heading > 330 && heading <= 360) {
        if (id == '6' || id == '7') {
            icon = '../images/fuellow-3_20.png';
        }
        else if (id == '3') {
            icon = '../images/pink-3_20.png';
        }
        else if (id == '4') {
            icon = '../images/fuelnormal-3_20.png';
        }
        else if (id == '5') {
            icon = '../images/fuelhigh-3_20.png';
        }
        else {
            icon = '../images/3_20.png';
        }
    }
    else {
        var hd = heading.split('-');
        if (hd != null) {
            if (hd[0] == 'A') {
                icon = '../images/fuellow-1_.png';   //+ hd[1] + '-alert.gif';
            }
        }
    }

    var marker = new google.maps.Marker({
        position: point,
        map: map,
        draggable: false,
        icon: icon,
        zIndex: 28800001
    });

    var tableAlign;
    if (VDirection == 'rtl') {
        tableAlign = 'right';
    }
    else {
        tableAlign = 'left';
    }
    var bubbleMessage = '<div style="text-align:' + tableAlign + ';"><table style="direction:' + VDirection + '" cellspacing=5 class=\'InfoBubble\'>';
    //var validlocationImage = addr == 'N/A' ? '<img src="../Images/icn-address-notvalid.gif" />' : '<img src="../Images/icn-address-valid.gif" />';
    var monitorTabs = [];

    if (isVehicleVisbile) {
        bubbleMessage += '<tr><td><b>' + ((vehCaption == null || vehCaption == '') ? 'Vehicle' : vehCaption) + '</b></td><td>' + VehName + '</td>';
        if (isDriverNameVisible) {
            bubbleMessage += '<td rowspan="3" align="left"><br><img src=" ' + ((driverPhoto == null || driverPhoto == '') ? '../images/default-user.png' : driverPhoto) + '" width="60px" height="60px" alt="Driver" /></td>';
        }
        bubbleMessage += '</tr>';
    }
    if (isDriverNameVisible) {
        bubbleMessage += '<tr><td><b>' + ((driverNameCaption == null || driverNameCaption == '') ? 'Driver' : driverNameCaption) + '</b></td><td>' + ((driverName == null || driverName == '') ? '-' : driverName) + '</td></tr>';
        bubbleMessage += '<tr><td><b>' + ((PhnoCaption == null || PhnoCaption == '') ? 'Phno' : PhnoCaption) + '</b></td><td>' + driverPhno + '</td></tr>';
    }
    if (hd != null && hd[0] != undefined && hd[0] == 'A' && isVehicleVisbile == true) {
        bubbleMessage += '<tr><td class="DateStyle"><b>' + VDateTime + '</b></td><td>' + hd[1] + '</td></tr>';
    }
    if (isMessageVisbile) {
        bubbleMessage += '<tr><td><b>' + ((msgCaption == null || msgCaption == '') ? VMessage : msgCaption) + '</b></td><td>' + msgDetails + '</td></tr>';
    }
    if (isAddressVisbile) {
        bubbleMessage += '<tr><td><b>' + ((addrCaption == null || addrCaption == '') ? VAddress : addrCaption) + '</b></td><td>' + addr + '</td></tr>';
    }

    if (isSpeedVisbile) {
        bubbleMessage += '<tr><td><b>' + ((speedCaption == null || speedCaption == '') ? 'Speed' : speedCaption) + '</b></td><td>' + speed + '</td></tr>';
    }
    if (landmarkName != '-') {
        bubbleMessage += '<tr><td width="40px"><b>' + landmarkCaption + '</b></td><td>' + landmarkName + '</td></tr>';
    }
    else {
        bubbleMessage += '<tr><td colspan="2"><a href="javascript:getlngs(' + temp + ',\'' + addr + '\');' +
        'document.getElementById(\'txtLocationName\').focus();">' + canAddLandmark + '<\/a></td></tr>';
    }
    bubbleMessage += '</table><div>';

    google.maps.event.addListener(marker, "mouseover", function () {
        if (infowindow) {
            infowindow.close();
        }
        infowindow.setContent(bubbleMessage);
        infowindow.open(map, marker);
    });
    return marker;
}

var ltMapIT = new Array();

//To plot the Map for MapIT
var clusterMarkers = new Array();
function DisplayMapIt(latlng, pageName, mainCaption, isMessageVisbile, msgCaption, isDateTimeVisible,
    datetimeCaption, isAddressVisible, addressCaption, isLandmarkVisible, landmarkCaption, isSpeedVisible,
    speedCaption, addLandmarkCaption, isVehicleVisbile, vehicleCaption, isPolylineVisible, driverNameCaption, isDriverNameVisible) {
    try {
        if (mapItMarkers == null) {
            mapItMarkers = new Array();
        }
        else {
            for (var j = 0; j < mapItMarkers.length; j++) {
                mapItMarkers[j].setMap(null);
            }
            mapItMarkers = new Array();
        }
        var mapTypeHolder = document.getElementById("hdnMapType");
        if (mapTypeHolder != null) {
            switch (mapTypeHolder.value) {
                case 'N': map.setMapTypeId(google.maps.MapTypeId.ROADMAP); break;
                case 'S': map.setMapTypeId(google.maps.MapTypeId.SATELLITE); break;
                case 'H': map.setMapTypeId(google.maps.MapTypeId.HYBRID); break;
                default: map.setMapTypeId(google.maps.MapTypeId.TERRAIN); break;
            }
        }
        if (pageName == 'H') {
            PerformScrollSetting();
            CheckMapItBoxes();
            SetDivPosition()
        }

        var bounds = new google.maps.LatLngBounds();
        //var clusterMarkers = new Array();

        ltMapIT = latlng.split('~&~');
        if (pageName == 'M' || pageName == 'MF') {
            try {
                if (clusterMarkers != null) {
                    if (clusterMarkers.length > 0) ClearOverlay(clusterMarkers)
                }
                else {
                    ClearMap();
                }
            }
            catch (ex) {
            }
        }
        for (var i = 0; i <= ltMapIT.length - 1; i++) {
            if (ltMapIT[i] == "") {
                break;
            }
            var lng = new Array();
            lng = ltMapIT[i].split("~#~");
            var point = new google.maps.LatLng(lng[0], lng[1]);
            bounds.extend(point);
            if (pageName == 'M' || pageName == 'MF') {
                var mapMarker = MapIT_Marker(point, lng[4], lng[3], lng[5], lng[6], i, lng[2], lng[2],
                                  lng[7], mainCaption, isVehicleVisbile, vehicleCaption, isMessageVisbile, msgCaption, isAddressVisible, addressCaption, isSpeedVisible, speedCaption,
                                  isLandmarkVisible, landmarkCaption, lng[8], addLandmarkCaption, isDriverNameVisible, driverNameCaption, lng[9], lng[10], lng[11], lng[12]);

                if (clusterMarkers != null) clusterMarkers.push(mapMarker);
            }
            else if (pageName == 'H') {
                var mapMarker = createMarker(point, lng[5], lng[3], lng[4], 'MapIt', i, lng[2], lng[6],
                    lng[7], lng[8], lng[9], mainCaption, isMessageVisbile, msgCaption, isDateTimeVisible,
                    datetimeCaption, isAddressVisible, addressCaption, isLandmarkVisible, landmarkCaption,
                     isSpeedVisible, speedCaption, addLandmarkCaption);
                Array.add(mapItMarkers, mapMarker);
                mapMarker.setMap(map);
            }
            else if (pageName == 'HF') {
                var mapMarker = createMarker(point, lng[5], lng[3], lng[4], '1', i, lng[2], lng[6],
                    lng[7], lng[8], lng[9], mainCaption, isMessageVisbile, msgCaption, isDateTimeVisible,
                    datetimeCaption, isAddressVisible, addressCaption, isLandmarkVisible, landmarkCaption,
                     isSpeedVisible, speedCaption, addLandmarkCaption);
                Array.add(mapItMarkers, mapMarker);
                mapMarker.setMap(null);
            }
        }
        if (pageName == 'M' || pageName == 'MF') {
            if (markerCluster != null) {
                markerCluster.clearMarkers();
            }
            markerCluster = new MarkerClusterer(map, clusterMarkers,
             { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
        }
        map.fitBounds(bounds);
        if (map.getZoom(bounds) > 18) map.setZoom(18);
        //        if (pageName == 'M') {
        //            if (MapView.length > 0) {
        //                map.setCenter(MapView[0], MapView[1]);
        //                map.setZoom(MapView[1]);
        //                Array.clear(MapView);
        //            }
        //        }
        //        else if (pageName == 'MF') {
        //            if (MapViewFullScreen.length > 0) {
        //                map.setCenter(MapViewFullScreen[0], MapViewFullScreen[1]);
        //                map.setZoom(MapViewFullScreen[1]);
        //                Array.clear(MapViewFullScreen);
        //            }
        //        }
        HidePopUp();
    }
    catch (Error) {
    }
}

//To plot the Map for MapIT
function DisplayUpdPosition(latlng) {
    try {
        collectdata = new google.maps.LatLngBounds();
        lt = latlng.split('&');

        for (var i = 0; i < lt.length; i++) {
            var lng = new Array();
            lng = lt[i].split("~#~");
            var point = new google.maps.LatLng(lng[0], lng[1]);
            map.setCenter(new google.maps.LatLng(lng[0], lng[1]), 12);
            MapIT_Marker(point, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '').srtMap(map);
            collectdata.extend(new google.maps.LatLng(lng[0], lng[1]));
        }
        map.setCenter(collectdata.getCenter(), map.getBoundsZoomLevel(collectdata) - 1);
    }
    catch (Error) {
    }
}

function getlngs(query, lndaddress) {
    try {
        var isIE = CheckBrowser();
        var lnd_Latlong = query.split(',');
        document.getElementById('txtlat').value = lnd_Latlong[0];
        document.getElementById('txtlong').value = lnd_Latlong[1];
        document.getElementById('txtstreet').value = lndaddress;
        document.getElementById('txtstreet').disabled = true;
        document.getElementById('pnlLandmark').style.display = "block";
    } catch (Error) {
    }
}

/* Functions related to Landmark Page */
var geo;
var reasons = [];
var getAddress = null;
var geocoder; var address;

var isIE = CheckBrowser();

function CheckBrowser() {
    var isIE = false;
    if (navigator.appName == "Microsoft Internet Explorer") {
        isIE = true;
    }
    else {
        isIE = false;
    }
    return isIE;
}
// ====== Plot a marker after positive reponse to "did you mean" ======
function place(lat, lng) {
    try {

        var icon = new google.maps.MarkerImage(LandMarkImage,
                   new google.maps.Size(32, 32),
                   new google.maps.Point(0, 0),
                   new google.maps.Point(0, 22));

        var point = new google.maps.LatLng(lat, lng);
        map.setCenter(point, 16);

        marker = new google.maps.Marker({
            position: point,
            icon: icon,
            draggable: false
        });


        marker.setMap(map);
        google.maps.event.addListener(marker, 'mouseover', function () {
            if (infowindow) {
                infowindow.close();
            }
            infowindow.setContent('<br /><table style="direction:' + VDirection + '" class=\'InfoBubble\'cellpadding=\'5\' cellspacing=\'5\'><tr><td><b>Address</b></td><td>:</td><td>' + search + '</td></tr></table>');
            infowindow.open(map, marker);
        });

        google.maps.event.addListener(marker, 'mouseout', function () {
            if (infowindow) {
                infowindow.close();
            }
        });

        var LocDesc = (document.getElementById('txtLocationDesc').value == "Description") ? "" : document.getElementById('txtLocationDesc').value;
        var Radius = (document.getElementById('txtRadius').value == "Radius") ? 500 : document.getElementById('txtRadius').value;
        getAddress = document.getElementById('txtLocationName').value + '#' + lat + '#' + lng + '#' + LocDesc + '#' + search + '#' + Radius + '#' /*+ document.getElementById('txtEmail').value + '#' + document.getElementById('txtSMS').value + '#'*/ + (document.getElementById('chkNotify').checked ? 1 : 0) + '#0';  /* + document.getElementById('ddlTimezone').value; */

        document.getElementById('txtlat').value = lat;
        document.getElementById('txtlong').value = lng;
        centerPoint = new google.maps.LatLng(lat, lng);
        document.getElementById("message").innerHTML = "";
        document.getElementById("pnlInfoWindow").style.display = "none";

        isEditable = true;
        isDraggable = false;
        drawCircle();
        map.fitBounds(circle.getBounds());
        LandMarkImage = '';
    } catch (Error) {
    }
}


function Findplace(lat, lng, lndMark, addr, radius, isView, image) {
    try {
        getAddress = null;
        if (image == null) {
            image = '../images/flag_2.png';
        }
        if (LandMarkImage == null || LandMarkImage == '')
            LandMarkImage = image;
        var icon = new google.maps.MarkerImage(LandMarkImage,
                   new google.maps.Size(32, 32),
                   new google.maps.Point(0, 0),
                   new google.maps.Point(0, 22));

        var point = new google.maps.LatLng(lat, lng);

        map.setCenter(point, 16);
        marker = new google.maps.Marker({
            position: point,
            icon: icon,
            draggable: false
        });

        marker.setMap(map);

        if (lndMark == '') {
            var LocDesc = (document.getElementById('txtLocationDesc').value == "Description") ? "" : document.getElementById('txtLocationDesc').value;
            var Radius = (document.getElementById('txtRadius').value == "Radius") ? 500 : document.getElementById('txtRadius').value;

            getAddress = document.getElementById('txtLocationName').value + '#' + lat + '#' + lng + '#' + LocDesc + '#' + search + '#' + Radius + '#' + /*document.getElementById('txtEmail').value + '#' + document.getElementById('txtSMS').value + '#'*/ +(document.getElementById('chkNotify').checked ? 1 : 0) + '#0';  /*+ document.getElementById('ddlTimezone').value; */
            document.getElementById('txtlat').value = lat;
            document.getElementById('txtlong').value = lng;

            google.maps.event.addListener(marker, "mouseover", function () {
                infowindow.setContent('<br /><table cellpadding=\'5\' class=\'InfoBubble\'cellspacing=\'5\'><tr><td><b>' + VAddress + '</b></td><td>:</td><td>' + search + '</td></tr></table>');
                infowindow.open(map, marker);
            });

            google.maps.event.addListener(marker, "mouseout", function () {
                if (infowindow) infowindow.close();
            });
        }
        else {

            google.maps.event.addListener(marker, "mouseover", function () {
                infowindow.setContent('<br/><table style="direction:' + VDirection + '" cellpadding=\'5\' class=\'InfoBubble\' cellspacing=\'5\'><tr style="direction:' + VDirection + '"><td><b>' + VLandmark + '</b></td><td>:</td><td>'
                 + lndMark + '</td></tr><tr><td><b>' + VAddress + '</b></td><td>:</td><td>' + addr + '</td></tr></table>');
                infowindow.open(map, marker);
            });

            google.maps.event.addListener(marker, "mouseout", function () { if (infowindow) infowindow.close(); });
        }

        centerPoint = new google.maps.LatLng(lat, lng);
        document.getElementById("message").innerHTML = "";

        isEditable = isView == "1" ? false : true;
        isDraggable = false;
        drawCircle();
        map.fitBounds(circle.getBounds());
        LandMarkImage = '';

    }
    catch (Error) {
    }
}

//Sakthi for Landmark View
function drawCircle_LandmarkPage(landmarkEntries, isLandmarkEnable) {
    var lanmarkInformation = landmarkEntries.toString().split("~&~");
    canClearCircle = (isLandmarkEnable) ? false : true;
    if (!isLandmarkEnable) {
        for (var n = 0; n < landmarkMarkers.length; n++) {
            landmarkMarkers[n].setMap(null);
        }
        landmarkMarkers.splice(n, 1);
        for (var c = 0; c < landMarkCircles.length; c++) {

            landMarkCircles[c].setMap(null);
        }
        landMarkCircles.splice(c, 1);
    }
    for (var iterator = 0; iterator < lanmarkInformation.length; iterator++) {
        if (lanmarkInformation[iterator] == "") {
            break;
        }
        else {
            var landmarkinfo = lanmarkInformation[iterator].split("~#~");
            centerPoint = new google.maps.LatLng(landmarkinfo[0], landmarkinfo[1]);
            map.setCenter(centerPoint, 16);
            map.setZoom(6);
            landmarkLatitude = landmarkinfo[0];
            landmarkLongitude = landmarkinfo[1];
            if (isLandmarkEnable) {
                var lndTemplate = '<table style="direction:' + VDirection + '" class=\'InfoBubble\' cellpadding=\'5\' cellspacing=\'2\'><tr><td colspan=3 width = "550px"><b><u>'
                + VLandmarkLocationDetails + '</u></b></td><tr><td><b>' + VOrgCoordinates + '</b></td><td>:</td><td>'
                + landmarkLatitude + " , " + landmarkLongitude
                + '</td></tr><tr><td><b>' + VAddress + '</b></td><td>:</td><td>' + landmarkinfo[4] + '</td></tr></table>';
                var lndMarks = flagMarker_LandmarkPage(centerPoint, landmarkinfo[3], landmarkinfo[4], landmarkinfo[0], 'green', 1, lndTemplate);
                landmarkMarkers.push(lndMarks);
            }
            circleRadius = landmarkinfo[2];
            if (isLandmarkEnable) { doDrawCircle(); map.fitBounds(circle.getBounds()) }


        }
    }
}
function flagMarker_LandmarkPage(point, lndName, lndAddr, time, id, i_No, content) {
    var lndImage = '../images/flag_2.png';
    if (document.getElementById('hdnLandmarkImage') != null && document.getElementById('hdnLandmarkImage').value != "") {

        lndImage = String(document.getElementById('hdnLandmarkImage').value);

    }
    infowindow = new google.maps.InfoWindow({ content: content });

    var icon = new google.maps.MarkerImage(lndImage,
                   new google.maps.Size(22, 22),
                   new google.maps.Point(0, 0),
                   new google.maps.Point(0, 22));

    var marker = new google.maps.Marker({
        position: point,
        map: map,
        icon: icon,
        draggable: false
    });

    //Open info bubble
    google.maps.event.addListener(marker, "mouseover", function () {
        if (infowindow) {
            infowindow.close();
        }
        infowindow.setContent(content);
        infowindow.open(map, marker);
    });
    return marker;
}
//End of Landmark View

var search = '';
var chkValue = 0;
var LandMarkImage = '';

// ====== Geocoding ======
function showAddress(IsNew, image) {
    try {
        if (marker) marker.setMap(null);
        if (image == null || image == '') {
            if (document.getElementById('hdnLandmarkImage') != null && document.getElementById('hdnLandmarkImage').value != "") {

                image = String(document.getElementById('hdnLandmarkImage').value);

            }
            else {
                image = '../images/flag_2.png';
            }
        }
        MarkerImage = image;
        LandMarkImage = image;
        getAddress = null;
        chkValue = 1;
        document.getElementById('hdnIsLocateMe').value = 'Y';

        if (document.getElementById('ddlType').value == 'addr') {
            search = FrameAddress();
            geo = new google.maps.Geocoder();
            // ====== Perform the Geocoding ======
            geo.geocode({ 'address': search }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results.length > 1) {
                        document.getElementById("message").innerHTML = "Did you mean:";
                        // Loop through the results
                        for (var i = 0; i < results.length; i++) {
                            var p = results[i].geometry.location;
                            document.getElementById("message").innerHTML += "<br>" + (i + 1) + ": <a href='#' onclick='place(" + p.lat() + "," + p.lng() + "); return false;'>" + results[i].formatted_address + "</a>";
                        }
                        document.getElementById("pnlInfoWindow").style.display = "block";
                        map.setCenter(new google.maps.LatLng(-13.880745, 79.101562));
                        map.setZoom(6);
                    }
                        // ===== If there was a single marker =====
                    else if (results.length == 1) {
                        document.getElementById("message").innerHTML = "";
                        var p = results[0].geometry.location;

                        if (document.getElementById('hdnLatLong') != null) {
                            document.getElementById('hdnLatLong').value = p.lat() + ',' + p.lng();
                        }

                        Findplace(p.lat(), p.lng(), '', document.getElementById('txtRadius').value, 0);
                        LandMarkImage = '';
                    }
                    else {
                        alert('Unable to find the address. Please verify the location');
                    }
                } else {
                    alert('Unable to find the address. Please verify the location');
                }
            });
        }
        else {

            //To Get the Address for the LatLng Values given by user            
            var latlong = new google.maps.LatLng(document.getElementById('txtlat').value, document.getElementById('txtlong').value);

            if (document.getElementById('hdnLatLong') != null) {
                document.getElementById('hdnLatLong').value = latlong.toUrlValue();
            }

            centerPoint = new google.maps.LatLng(document.getElementById('txtlat').value, document.getElementById('txtlong').value);
            map.setCenter(centerPoint, 16);

            //var geoFinder = new GClientGeocoder();
            var geoFinder = new google.maps.Geocoder();
            isDraggable = (IsNew == "0" || IsNew == '') ? false : true;
            geoFinder.geocode({ 'latLng': latlong }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        place = results[0];
                        var icon = new google.maps.MarkerImage(LandMarkImage,
                                   new google.maps.Size(22, 22),
                                   new google.maps.Point(0, 0),
                                   new google.maps.Point(0, 22));

                        marker = new google.maps.Marker({
                            position: centerPoint,
                            map: map,
                            icon: icon,
                            draggable: isDraggable
                        });
                        //isDraggable = true;
                        google.maps.event.addListener(marker, "dragstart", function () {
                            if (infowindow) infowindow.close();
                        });

                        google.maps.event.addListener(marker, 'dragend', function () {
                            document.getElementById('txtlat').value = marker.position.lat();
                            document.getElementById('txtlong').value = marker.position.lng();
                            point = new google.maps.LatLng(document.getElementById('txtlat').value, document.getElementById('txtlong').value);
                        });

                        google.maps.event.addListener(marker, "mouseover", function () {
                            infowindow.setContent('<table style="direction:' + VDirection + '" class=\'InfoBubble\' cellpadding=\'5\' cellspacing=\'2\'><tr><td colspan=3 width = "550px"><b><u>'
                                                    + VLandmarkLocationDetails + '</u></b></td><tr><td><b>' + VOrgCoordinates + '</b></td><td>:</td><td>'
                                                    + latlong.lat() + " , " + latlong.lng()
                                                    + '</td></tr><tr><td><b>' + VAddress + '</b></td><td>:</td><td>' + place.formatted_address + '</td></tr></table>');
                            infowindow.open(map, marker);
                        });

                        google.maps.event.addListener(marker, "mouseout", function () {
                            if (infowindow) infowindow.close();
                        });
                        var LocDesc = (document.getElementById('txtLocationDesc').value == "Description") ? "" : document.getElementById('txtLocationDesc').value;
                        var Radius = (document.getElementById('txtRadius').value == "Radius") ? 500 : document.getElementById('txtRadius').value;


                        getAddress = document.getElementById('txtLocationName').value + '#' + centerPoint.lat() + '#' + centerPoint.lng() + '#' + LocDesc + '#' + place.formatted_address + '#' + Radius + '#' + (document.getElementById('chkNotify').checked ? 1 : 0) + '#0';
                        document.getElementById('txtstreet').value = place.formatted_address;

                        centerPoint = new google.maps.LatLng(document.getElementById('txtlat').value, document.getElementById('txtlong').value);
                        isEditable = (IsNew == "0" || IsNew == '') ? false : true;
                        drawCircle();
                        map.fitBounds(circle.getBounds());
                        LandMarkImage = '';
                    }
                } else {
                    alert("Address Cannot be found. Please check the LatLong Values ");
                }
            });

            // showControls(1);
        }
    } catch (Error) {
    }
}

var address1 = null;
function FrameAddress() {
    try {
        address1 = ''

        if (document.getElementById('txtstreet').value != '') {
            if (address1 != '') {
                address1 = address1 + ' ' + document.getElementById('txtstreet').value;
            }
            else {
                address1 = document.getElementById('txtstreet').value;
            }
        }
        if (document.getElementById('txtcity').value != '' && document.getElementById('txtcity').value != "City") {
            if (address1 != '') {
                address1 = address1 + ',' + document.getElementById('txtcity').value;
            }
            else {
                address1 = document.getElementById('txtcity').value;
            }
        }
        if (document.getElementById('txtstate').value != '' && document.getElementById('txtstate').value != "State") {
            if (address1 != '') {
                address1 = address1 + ',' + document.getElementById('txtstate').value;
            }
            else {
                address1 = document.getElementById('txtstate').value;
            }
        }

        if (document.getElementById('txtCountry').value != '' && document.getElementById('txtCountry').value != "Country") {
            if (address1 != '') {
                address1 = address1 + ',' + document.getElementById('txtCountry').value;
            }
            else {
                address1 = document.getElementById('txtCountry').value;
            }
        }
        return address1;
    } catch (Error) {
    }
}

function AddToDB() {
    try {
        var isError = false;
        var alertMessage = '';
        var txtLocationName = document.getElementById('txtLocationName');
        var controlToBeFocussed;
        var txtRadius = document.getElementById('txtRadius');
        var hdnLandmark = document.getElementById('hdnLand');
        if (txtLocationName.value == "Name" || RemoveSpaces(txtLocationName).length == 0) {
            alertMessage = locationNameAlert;
            isError = true;
            controlToBeFocussed = txtLocationName;
            txtLocationName.style.backgroundColor = 'lightyellow';
        }
        else {
            txtLocationName.style.backgroundColor = 'white';
        }
        if (txtRadius.value == "Radius" || RemoveSpaces(txtRadius).length == 0 || isNaN(txtRadius.value)) {
            alertMessage += (isError ? '\n' : '') + radiusAlert;
            txtRadius.style.backgroundColor = 'lightyellow';
            controlToBeFocussed = isError ? controlToBeFocussed : txtRadius;
            isError = true;
        }
        else {
            if (eval(txtRadius.value) == 0) {
                alertMessage += (isError ? '\n' : '') + radiusAlert;
                txtRadius.style.backgroundColor = 'lightyellow';
                controlToBeFocussed = isError ? controlToBeFocussed : txtRadius;
                isError = true;
            }
            else {
                txtRadius.style.backgroundColor = 'white';
            }
        }
        if (!isError) {
            if (chkValue == 0) {
                alertMessage += (isError ? '\n' : '') + locateMeError;
                controlToBeFocussed = isError ? controlToBeFocussed : document.getElementById('btnAddress');
                isError = true;
            }
        }
        if (!isError) {
            if (getAddress != null) {
                document.getElementById('hdnLand').value = getAddress;
            }
            else {
                alertMessage += (isError ? '\n' : '') + locationAlert;
                isError = true;
            }
        }
    }
    catch (Error) {
        isError = true;
    }
    if (isError) { alert(alertMessage); if (controlToBeFocussed != null) { controlToBeFocussed.focus(); } }
    return !isError;
}

function ReceiveServerData(arg, context) {
}

/* Function for zoom-in ,zoom-out in Context Menu */

function hideContext() {
    contextmenu.style.visibility = "hidden";
}
// === functions that perform the context menu options ===
function zoomIn() {
    // perform the requested operation
    map.zoomIn();
    // hide the context menu now that it has been used
    contextmenu.style.visibility = "hidden";
}
function zoomOut() {
    // perform the requested operation
    map.zoomOut();
    // hide the context menu now that it has been used
    contextmenu.style.visibility = "hidden";
}



/* End of Function Context Menu */
function showControls(typeid) {
    try {
        if (typeid == '0') {
            document.getElementById('spLatlng').style.display = 'none';
            document.getElementById('spAddr').style.display = (CheckBrowser() ? "block" : "table-row");
            document.getElementById('txtlat').value = '';
            document.getElementById('txtlong').value = '';
        }
        else {
            document.getElementById('ddlType').value = 'ltlng';
            document.getElementById('spLatlng').style.display = (CheckBrowser() ? "block" : "table-row");
            document.getElementById('spAddr').style.display = 'none';
        }
    }
    catch (Error) {
    }
}
//function showAddress_Latlng(response) {
//    if (document.getElementById('ddlType') != null) {
//        showControls(document.getElementById('ddlType').selectedIndex);
//    }

//    //var icon = new GIcon(G_DEFAULT_ICON);

//    var icon = new google.maps.MarkerImage(LandMarkImage,
//      new google.maps.Size(32, 32),
//      new google.maps.Point(0, 0),
//      new google.maps.Point(0, 32));

//    //    icon = new GIcon(icon, LandMarkImage);
//    //    icon.iconSize = new GSize(32, 32);

//    if (!response || response.Status.code != 200) {
//        alert("Address Cannot be found. Please check the LatLong Values ");
//    } else {
//        if (response != null) {
//            place = response.Placemark[0];

//            marker = new google.maps.Marker({
//                position: centerPoint,
//                map: map,
//                icon: icon,
//                draggable: true
//            });

//            //marker = new GMarker(centerPoint, { draggable: true, icon: icon });

//            google.maps.event.addListener(marker, 'dragstart', function() {
//                infowindow.close();
//            });


//            //            GEvent.addListener(marker, "dragstart", function() {
//            //                map.closeInfoWindow();
//            //            });

//            google.maps.event.addListener(marker, 'dragend', function() {
//                document.getElementById('txtlat').value = marker.position.lat();
//                document.getElementById('txtlong').value = marker.position.lng();
//                point = new google.maps.LatLng(document.getElementById('txtlat').value, document.getElementById('txtlong').value);
//            });

//            marker.setMap(map);
//            //map.addOverlay(marker);

//            google.maps.event.addListener(marker, "mouseover", function() {

//            infowindow.setContent('<table style="direction:' + VDirection + '" class=\'InfoBubble\' cellpadding=\'5\' cellspacing=\'2\'><tr><td colspan=3><b><u>' 
//                                        + VLandmarkLocationDetails + '</u></b></td><tr><td><b>' + VOrgCoordinates + '</b></td><td>:</td><td>'
//                                        + response.name.split(",")[0] + " , " + response.name.split(",")[1]
//                                        + '</td></tr><tr><td><b>' + VAddress + '</b></td><td>:</td><td>' + place.address + '</td></tr></table>');
//                infowindow.open(map, marker);

//                //                marker.openInfoWindowHtml(
//                //            '<table style="direction:' + VDirection + '" class=\'InfoBubble\' cellpadding=\'5\' cellspacing=\'2\'><tr><td colspan=3><b><u>' + VLandmarkLocationDetails + '</u></b></td><tr><td><b>' + VOrgCoordinates + '</b></td><td>:</td><td>'
//                //            + response.name.split(",")[0] + " , " + response.name.split(",")[1]
//                //            + '</td></tr><tr><td><b>' + VAddress + '</b></td><td>:</td><td>' + place.address + '</td></tr></table>');
//            });

//            google.maps.event.addListener(marker, "mouseout", function() { infowindow.close(); });
//        }
//        var LocDesc = (document.getElementById('txtLocationDesc').value == "Description") ? "" : document.getElementById('txtLocationDesc').value;
//        var Radius = (document.getElementById('txtRadius').value == "Radius") ? 500 : document.getElementById('txtRadius').value;


//        getAddress = document.getElementById('txtLocationName').value + '#' + centerPoint.y + '#' + centerPoint.x + '#' + LocDesc + '#' + place.address + '#' + Radius + '#' + /*document.getElementById('txtEmail').value + '#' + document.getElementById('txtSMS').value + '#' + document.getElementById('ddlSeverity').value */(document.getElementById('chkNotify').checked ? 1 : 0) + '#0';  /* + document.getElementById('ddlTimezone').value; */
//        document.getElementById('txtstreet').value = place.address;
//        centerPoint = new GLatLng(document.getElementById('txtlat').value, document.getElementById('txtlong').value);
//        drawCircle();
//    }
//}
var landMarkLabels = new Array();
function drawLabelForLandmark(landmarkEntries, isLandmarkLabelEnable) {
    var lanmarklblInformation = landmarkEntries.toString().split("~&~");
    canClearCircle = (isLandmarkLabelEnable) ? false : true;
    if (!isLandmarkLabelEnable) {
        for (var n = 0; n < landMarkLabels.length; n++) {
            map.removeOverlay(landMarkLabels[n]);
        }
        landMarkLabels.splice(n, 1);
    }
    for (var iterator = 0; iterator < lanmarklblInformation.length; iterator++) {
        if (lanmarklblInformation[iterator] == "") {
            break;
        }
        else {
            if (isLandmarkLabelEnable) {
                var landmarkinfo = lanmarklblInformation[iterator].split("~#~");
                centerPoint = new GLatLng(landmarkinfo[0], landmarkinfo[1]);
                // An ELabel with complex contents
                var stuff = '<div style="text-align:center;padding: 0px 0px 8px 8px;width:250px;"><div style="display:inline-block;background-color:#CBDAEF;border:1px solid #003366;padding:2px;float:left;color:#003366">' + landmarkinfo[3] + '</div></div>'; //background: url(../images/point_bottom_left.png) no-repeat bottom left
                var label = new ELabel(centerPoint, stuff, null, new GSize(0, 0));
                landMarkLabels.push(label);
                map.addOverlay(label);
            }
        }
    }
}

var landmarkLatitude = '';
var landmarkLongitude = '';
var landmarkMarkers = new Array();
var landMarkCircles = new Array();
function drawCircleForLandmark(landmarkEntries, isLandmarkEnable) {
    var lanmarkInformation = landmarkEntries.toString().split("~&~");
    canClearCircle = (isLandmarkEnable) ? false : true;
    if (!isLandmarkEnable) {
        for (var n = 0; n < landmarkMarkers.length; n++) {
            landmarkMarkers[n].setMap(null);
        }
        landmarkMarkers.splice(n, 1);
        for (var c = 0; c < landMarkCircles.length; c++) {

            landMarkCircles[c].setMap(null);
        }
        landMarkCircles.splice(c, 1);
    }
    for (var iterator = 0; iterator < lanmarkInformation.length; iterator++) {
        if (lanmarkInformation[iterator] == "") {
            break;
        }
        else {
            var landmarkinfo = lanmarkInformation[iterator].split("~#~");
            centerPoint = new google.maps.LatLng(landmarkinfo[0], landmarkinfo[1]);
            landmarkLatitude = landmarkinfo[0];
            landmarkLongitude = landmarkinfo[1];
            if (isLandmarkEnable) {
                var lndMarks = flagMarker(centerPoint, landmarkinfo[3], landmarkinfo[4], landmarkinfo[0], 'green', 1)
                landmarkMarkers.push(lndMarks);
            }
            circleRadius = landmarkinfo[2];
            if (isLandmarkEnable) { doDrawCircle(); }
        }
    }
}
function flagMarker(point, lndName, lndAddr, time, id, i_No) {

    var icon = new google.maps.MarkerImage('../images/flag_2.png',
                   new google.maps.Size(32, 32),
                   new google.maps.Point(0, 0),
                   new google.maps.Point(0, 22));

    var marker = new google.maps.Marker({
        position: point,
        map: map,
        icon: icon,
        draggable: false
    });

    //Open info bubble
    google.maps.event.addListener(marker, "mouseover", function () {
        if (infowindow) {
            infowindow.close();
        }
        infowindow.setContent(
        '<br><table style="direction:' + VDirection + '" class=\'InfoBubble\' cellspacing=\'2\'><tr><td><b>' + VLandmark + '</b></td><td><b>:</b></td></td><td>' + lndName + '</td></tr><td>'
        + '<b>' + VAddress + '</b></td><td><b>:</b></td><td>' + lndAddr + '</td></tr></table>');
        infowindow.open(map, marker);
    });
    return marker;
}
var centerMarker;
var circleUnits;
var circleRadius;
var centerPoint;

function drawCircle() {
    try {
        var oRadius = document.getElementById('txtRadius');
        oRadius.value = (oRadius.value != '' && oRadius.value != "Radius") ? oRadius.value : 500;

        if (oRadius.value.match(/[^\d.]/)) {
            alert("Enter a number for radius");
            return;
        }
        if (oRadius.value > 9999) {
        }
        circleRadius = oRadius.value;
        doDrawCircle();
    }
    catch (Error) {
    }
}

function doDrawCircle() {
    try {
        if (circle && canClearCircle) {
            circle.setMap(null);
        }
        var center = map.getCenter();
        var bounds = new google.maps.LatLngBounds();
        //isEditable = isEdit;

        var radius = parseInt(circleRadius);
        var populationOptions = {
            strokeColor: "#5270B2",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#D8E2FA",
            fillOpacity: 0.25,
            center: centerPoint,
            radius: radius,
            editable: isEditable
        };

        circle = new google.maps.Circle(populationOptions);
        circle.setMap(map);

        if (isEditable) {

            //Radius Change Event
            google.maps.event.addListener(circle, 'radius_changed', function () {
                circleRadius = Math.round(circle.getRadius());
                var center = circle.getCenter();
                document.getElementById('txtRadius').value = circleRadius;
                var LocDesc = (document.getElementById('txtLocationDesc').value == "Description") ? "" : document.getElementById('txtLocationDesc').value;
                var Radius = (document.getElementById('txtRadius').value == "Radius") ? 500 : document.getElementById('txtRadius').value;
                getAddress = document.getElementById('txtLocationName').value + '#' + centerPoint.lat() + '#' + centerPoint.lng() + '#' + LocDesc + '#' + place.formatted_address + '#' + Radius + '#' + (document.getElementById('chkNotify').checked ? 1 : 0) + '#0';
            });

            //Center Change Event
            google.maps.event.addListener(circle, 'center_changed', function () {
                circleRadius = Math.round(circle.getRadius());
                var center = circle.getCenter();
                document.getElementById('txtRadius').value = circleRadius;
                var LocDesc = (document.getElementById('txtLocationDesc').value == "Description") ? "" : document.getElementById('txtLocationDesc').value;
                var Radius = (document.getElementById('txtRadius').value == "Radius") ? 500 : document.getElementById('txtRadius').value;
                getAddress = document.getElementById('txtLocationName').value + '#' + centerPoint.lat() + '#' + centerPoint.lng() + '#' + LocDesc + '#' + place.formatted_address + '#' + Radius + '#' + (document.getElementById('chkNotify').checked ? 1 : 0) + '#0';

                document.getElementById('txtlat').value = Math.round(center.lat() * 1000000) / 1000000;
                document.getElementById('txtlong').value = Math.round(center.lng() * 1000000) / 1000000;
                document.getElementById('txtstreet').value = place.formatted_address;


                var geoFinder = new google.maps.Geocoder();

                geoFinder.geocode({ 'latLng': center }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            place = results[0];
                            var icon = new google.maps.MarkerImage(MarkerImage, //'../images/flag_2.png'
                                       new google.maps.Size(32, 32),
                                       new google.maps.Point(0, 0),
                                       new google.maps.Point(0, 22));

                            if (marker) marker.setMap(null);
                            marker = new google.maps.Marker({
                                position: center,
                                map: map,
                                icon: icon,
                                draggable: isDraggable
                            });

                            google.maps.event.addListener(marker, "dragstart", function () {
                                if (infowindow) infowindow.close();
                            });

                            google.maps.event.addListener(marker, 'dragend', function () {
                                document.getElementById('txtlat').value = marker.position.lat();
                                document.getElementById('txtlong').value = marker.position.lng();
                                point = new google.maps.LatLng(document.getElementById('txtlat').value, document.getElementById('txtlong').value);
                            });

                            google.maps.event.addListener(marker, "mouseover", function () {
                                var latlong = new google.maps.LatLng(document.getElementById('txtlat').value, document.getElementById('txtlong').value);
                                infowindow.setContent('<table style="direction:' + VDirection + '" class=\'InfoBubble\' cellpadding=\'5\' cellspacing=\'2\'><tr><td colspan=3><b><u>'
                                                    + VLandmarkLocationDetails + '</u></b></td><tr><td><b>' + VOrgCoordinates + '</b></td><td>:</td><td>'
                                                    + latlong.lat() + " , " + latlong.lng()
                                                    + '</td></tr><tr><td><b>' + VAddress + '</b></td><td>:</td><td>' + place.formatted_address + '</td></tr></table>');
                                infowindow.open(map, marker);
                            });

                            google.maps.event.addListener(marker, "mouseout", function () {
                                if (infowindow) infowindow.close();
                            });

                            //                            getAddress = document.getElementById('txtLocationName').value + '#' + centerPoint.lat() + '#' + centerPoint.lng() + '#' + LocDesc + '#' + place.formatted_address + '#' + Radius + '#' + (document.getElementById('chkNotify').checked ? 1 : 0) + '#0';
                            //                            document.getElementById('txtstreet').value = place.formatted_address;
                        }
                    }
                });
            });

            //            google.maps.event.addListener(marker, "dragstart", function() {
            //                if (infowindow) infowindow.close();
            //            });

            //            google.maps.event.addListener(marker, 'dragend', function() {
            //                document.getElementById('txtlat').value = marker.position.lat();
            //                document.getElementById('txtlong').value = marker.position.lng();
            //                point = new google.maps.LatLng(document.getElementById('txtlat').value, document.getElementById('txtlong').value);
            //            });

            //            google.maps.event.addListener(marker, "mouseover", function() {
            //                //To Get the Address for the LatLng Values given by user
            //                var latlong = new google.maps.LatLng(document.getElementById('txtlat').value, document.getElementById('txtlong').value);

            //                infowindow.setContent('<table style="direction:' + VDirection + '" class=\'InfoBubble\' cellpadding=\'5\' cellspacing=\'2\'><tr><td colspan=3><b><u>'
            //                                                    + VLandmarkLocationDetails + '</u></b></td><tr><td><b>' + VOrgCoordinates + '</b></td><td>:</td><td>'
            //                                                    + latlong.lat() + " , " + latlong.lng()
            //                                                    + '</td></tr><tr><td><b>' + VAddress + '</b></td><td>:</td><td>' + place.formatted_address + '</td></tr></table>');
            //                infowindow.open(map, marker);
            //            });

            //            google.maps.event.addListener(marker, "mouseout", function() {
            //                if (infowindow) infowindow.close();
            //            });

        }

        //isEdit = true;
        landMarkCircles.push(circle);
    }
    catch (Error) {
    }
}

function plotLandMark(latlong) {
    try {
        //To Get the Address for the LatLng Values given by user
        var latlong = latlong;
        var ltlng = latlong.split(',');
        centerPoint = new GLatLng(ltlng[0], ltlng[1]);
        var geoFinder = new GClientGeocoder();
        geoFinder.getLocations(latlong, showAddress_Latlng);
    }
    catch (Error) {
    }
}

/* End of Landmark page */


function DoCancel() {
    try {
        $find("mpAddEditLandmarkCategory").hide();
    }
    catch (Error) {
    }
}

/*********** Functions for Map It************************/
function SetMapItValue(mapItValue, isChecked, checkBoxName) {
    // debugger;
    var mapValue = document.getElementById('hdnMapItValue').value;
    var mapItValueList = mapValue.split('~&~');
    if (isChecked) {
        if (!Array.contains(mapItValueList, mapItValue.toString().replace('~&~', ''))) {
            mapValue += mapItValue;
        }
    } else {
        if (Array.contains(mapItValueList, mapItValue.toString().replace('~&~', ''))) {
            Array.remove(mapItValueList, mapItValue.toString().replace('~&~', ''));
            mapValue = mapItValueList.join('~&~');
        }
    }
    document.getElementById('hdnMapItValue').value = mapValue;
}
function MapIt(errorMessage, pageName) {

    if (document.getElementById('hdnMapItValue').value.length > 0) {
        ShowPopUp();
        eval("DisplayMapIt('" + document.getElementById('hdnMapItValue').value + "\',\'" + pageName + "\'," +
                document.getElementById('hdnInfoBubbleProcessing').value + ')');
    }
    else {
        alert(errorMessage);
    }
    return false;
}

function SelectGridRow(keyValue, isChecked) {
    gvData.SelectRowsByKey(keyValue, isChecked);
}

//To maintain the zoom level after auto referesh.
function GetMapView() {
    Array.clear(MapView);
    MapView.push(map.getCenter());
    MapView.push(map.getZoom());
}

function GetMapViewFullScreen() {
    Array.clear(MapViewFullScreen);
    MapViewFullScreen.push(map.getCenter());
    MapViewFullScreen.push(map.getZoom());
}

//Set Center to its org country.
function SetOrgCenter(coord) {
    var point = coord.split(',')
    if (map) {

        map.setCenter(new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1])), parseFloat(point[2]));

        //        map.set('center', new nokia.maps.geo.Coordinate(parseFloat(point[0]), parseFloat(point[1])));
        //        map.setZoomLevel(parseFloat(point[2]), "default");
    }
    orgCenter = point; //new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1]));
    orgZoomLevel = point[2];
}

//To clear the all the overlays in the maps container.
function ClearOverlays() {
    //map.clearOverlays();
    ClearMap();
}

function ClearMap() {
    //document.getElementById('map-dsply').style.height = (document.body.clientHeight / 2) + 'px';
    map = new google.maps.Map(document.getElementById("map-dsply"),
            {
                center: new google.maps.LatLng(23.805450, 78.486328),//centerCoordinate,
                zoom: 4,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                panControl: true,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE
                },
                mapTypeControl: true,
                scaleControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                //                streetViewControl: true,
                overviewMapControl: true
            });
}
//Set Center to dubai
function SetCenter() {
    //    if (map) {
    //        map.set('center', centerCoordinate);
    //        map.setZoomLevel(4, "default");
    //    }
}


function clearArray() {
}

function ClearOverlay(markers) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    Array.clear(markers);
}
//Jquery Collapse Panel form Legend
function CollapseLegend(MemberName, tab) {
    //$("#" + MemberName).slideToggle("slow");
};

function Deselect() {
    document.getElementById('chkLandmark').checked = false;
}

function CheckBrowserForBubble() {
    var isIE = false;
    if (navigator.appName == "Microsoft Internet Explorer") {
        var version = null;
        version = navigator.appVersion.substring(0, 3);
        isIE = parseFloat(version) < 5.0 ? true : false;
        IsMSIE9 = navigator.appVersion.substring(25, 19) == "IE 9.0" ? true : false;
    }
    else {
        isIE = false;
    }
    return isIE;
}

/********************Colapse panel JQuery foe Legends***************/

var PANEL_NORMAL_CLASS = "panel";
var PANEL_COLLAPSED_CLASS = "panelcollapsed";
var PANEL_HEADING_TAG = "h2";
var PANEL_CONTENT_CLASS = "panelcontent";
var PANEL_COOKIE_NAME = "panels";
var PANEL_ANIMATION_DELAY = 15; /*ms*/
var PANEL_ANIMATION_STEPS = 10;

function setUpPanels() {
    loadSettings();

    // get all headings
    var headingTags = document.getElementsByTagName(PANEL_HEADING_TAG);

    // go through all tags
    for (var i = 0; i < headingTags.length; i++) {
        var el = headingTags[i];

        // make sure it's the heading inside a panel
        if (el.parentNode.className != PANEL_NORMAL_CLASS && el.parentNode.className != PANEL_COLLAPSED_CLASS)
            continue;

        // get the text value of the tag
        var name = el.firstChild.nodeValue;

        // look for the name in loaded settings, apply the normal/collapsed class
        if (panelsStatus[name] == "false")
            el.parentNode.className = PANEL_COLLAPSED_CLASS;
        else
            if (panelsStatus[name] == "true")
                el.parentNode.className = PANEL_NORMAL_CLASS;
            else {
                // if no saved setting, see the initial setting
                panelsStatus[name] = (el.parentNode.className == PANEL_NORMAL_CLASS) ? "true" : "false";
            }

        // add the click behavor to headings
        el.onclick = function () {
            var target = this.parentNode;
            var name = this.firstChild.nodeValue;
            var collapsed = (target.className == PANEL_COLLAPSED_CLASS);
            saveSettings(name, collapsed ? "true" : "false");
            animateTogglePanel(target, collapsed);
        };
    }
}

function animateTogglePanel(panel, expanding) {
    // find the .panelcontent div
    var elements = panel.getElementsByTagName("div");
    var panelContent = null;
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].className == PANEL_CONTENT_CLASS) {
            panelContent = elements[i];
            break;
        }
    }

    // make sure the content is visible before getting its height
    panelContent.style.display = "block";

    // get the height of the content
    var contentHeight = panelContent.offsetHeight;

    // if panel is collapsed and expanding, we must start with 0 height
    if (expanding)
        panelContent.style.height = "0px";

    var stepHeight = contentHeight / PANEL_ANIMATION_STEPS;
    var direction = (!expanding ? -1 : 1);

    setTimeout(function () { animateStep(panelContent, 1, stepHeight, direction) }, PANEL_ANIMATION_DELAY);
}


function animateStep(panelContent, iteration, stepHeight, direction) {
    if (iteration < PANEL_ANIMATION_STEPS) {
        panelContent.style.height = Math.round(((direction > 0) ? iteration : 10 - iteration) * stepHeight) + "px";
        iteration++;
        setTimeout(function () { animateStep(panelContent, iteration, stepHeight, direction) }, PANEL_ANIMATION_DELAY);
    }
    else {
        // set class for the panel
        panelContent.parentNode.className = (direction < 0) ? PANEL_COLLAPSED_CLASS : PANEL_NORMAL_CLASS;
        // clear inline styles
        panelContent.style.display = panelContent.style.height = "";
    }
}

function loadSettings() {
    // prepare the object that will keep the panel statuses
    panelsStatus = {};

    // find the cookie name
    var start = document.cookie.indexOf(PANEL_COOKIE_NAME + "=");
    if (start == -1) return;

    // starting point of the value
    start += PANEL_COOKIE_NAME.length + 1;

    // find end point of the value
    var end = document.cookie.indexOf(";", start);
    if (end == -1) end = document.cookie.length;

    // get the value, split into key:value pairs
    var cookieValue = unescape(document.cookie.substring(start, end));
    var panelsData = cookieValue.split("|");

    // split each key:value pair and put in object
    for (var i = 0; i < panelsData.length; i++) {
        var pair = panelsData[i].split(":");
        panelsStatus[pair[0]] = pair[1];
    }
}

function expandAll() {
    for (var key in panelsStatus)
        saveSettings(key, "true");

    setUpPanels();
}

function collapseAll() {
    for (var key in panelsStatus)
        saveSettings(key, "false");

    setUpPanels();
}

function saveSettings(key, value) {
    // put the new value in the object
    panelsStatus[key] = value;

    // create an array that will keep the key:value pairs
    var panelsData = [];
    for (var key in panelsStatus)
        panelsData.push(key + ":" + panelsStatus[key]);

    // set the cookie expiration date 1 year from now
    var today = new Date();
    var expirationDate = new Date(today.getTime() + 365 * 1000 * 60 * 60 * 24);
    // write the cookie
    document.cookie = PANEL_COOKIE_NAME + "=" + escape(panelsData.join("|")) + ";expires=" + expirationDate.toGMTString();
}

// Register setUpPanels to be executed on load
if (window.addEventListener) {
    // the "proper" way
    window.addEventListener("load", setUpPanels, false);
}
else
    if (window.attachEvent) {
        // the IE way
        window.attachEvent("onload", setUpPanels);
    }
//To set the Collapsable legends alive.
Sys.Application.add_load(setUpPanels);
/********************End of Colapse panel JQuery foe Legends***************/

/***********************************History Play Back******************************************/
var route;
var coordPlayBack = null;
var iconPlayback = null;
var fastSpeed = 1000;
var mediumSpeed = 1500;
var slowSpeed = 2000;
var collectdataPlayback = null;


function playBack(arr) {

    var doc = document,
    // Alias function for getElementById
    $ = function (id) {
        return doc.getElementById(id);
    },
    btn = $("btn"),
    animate = $("animate"),
    resetPlay = $("resetPlay"),
    stopPlayBack = $("stopPlayBack"),
    fast = $("fast"),
    medium = $("medium"),
    slow = $("slow");

    animate.title = Caption_Play;
    resetPlay.title = Caption_Reset;
    stopPlayBack.title = Caption_Stop;
    fast.title = Caption_Fast;
    medium.title = Caption_Medium;
    slow.title = Caption_Slow;


    collectdataPlayback = new google.maps.LatLngBounds();

    var lntlng = new Array();
    try {
        for (var i = 0; i < arr.length; i++) {
            collectdataPlayback.extend(arr[i]);
        }
    }
    catch (ex) {
    }


    icon = new google.maps.MarkerImage("../images/Start_point.png",
    new google.maps.Size(32, 32),
                new google.maps.Point(0, 0),
                new google.maps.Point(4, 28));

    Start = new google.maps.Marker({
        position: arr[0],
        icon: icon,
        draggable: false,
        zIndex: 28800001
    });

    iconEnd = new google.maps.MarkerImage("../images/End_point.png",
                new google.maps.Size(32, 32),
                new google.maps.Point(0, 0),
                new google.maps.Point(4, 28));

    End = new google.maps.Marker({
        position: arr[arr.length - 1],
        icon: iconEnd,
        draggable: false,
        zIndex: 28800001
    });

    coordPlayBack = arr[0];
    iconPlayback = PlayBack[coordPlayBack.lat() + "," + coordPlayBack.lng()].icon;

    iconBus = new google.maps.MarkerImage(iconPlayback,
                new google.maps.Size(45, 45),
                new google.maps.Point(0, 0),
                new google.maps.Point(9, 12));

    busMarker = new google.maps.Marker({
        position: arr[0],
        icon: iconBus,
        draggable: false,
        zIndex: 28800001
    });

    // We add above created three object to the map and we change the zoomLevel
    // in such a way that the route is fully visible with the browser's window.
    Start.setMap(map);
    End.setMap(map);
    busMarker.setMap(map);
    map.fitBounds(collectdataPlayback);


    var time = 1500;
    var count = 0;
    var startCount = 0;
    var CanZoom = false;

    Walker = function (marker, path) {
        this.path = path;
        this.marker = marker;
        this.idx = 0;
        this.dir = -1;
        this.isWalking = false;
        var that = this;
        this.walk = function () {
            // Get the next coordinate from the route and set the marker to this coordinate
            var coord = path[that.idx];
            marker.setPosition(coord);
            if (infowindow) infowindow.close();

            var Info = PlayBack[coord.lat() + "," + coord.lng()];
            if (document.getElementById('chkInfoBubble').checked) {
                if (!CheckBrowserForBubble() || IsMSIE9 == true) {
                    infowindow.setContent(Info.Info);
                    infowindow.open(map, marker);
                    //bubbles = infoBubble.addBubble(Info.Info, coord);
                }
                else {
                    setTimeout(function () {
                        infowindow.setContent(Info.Info);
                        infowindow.open(map, marker);
                    }, 500);
                }
                //bubbles = infoBubble.addBubble(Info.Info, coord);
            }


            if (Info.Alarm) {
                marker.getIcon().anchor.x = 15;
                marker.getIcon().anchor.y = 31;
                //marker.set("anchor", new nokia.maps.util.Point(15, 31))
                var markerAlarm = plotPlaynBackAlarm(Info.Info, coord);

                markerAlarm.setMap(map);
                playAlarm.push(markerAlarm);
            }
            else {
                marker.getIcon().url = Info.icon;
                //marker.set("icon", Info.icon);                
                if (Info.icon == '../images/NW.png' || Info.icon == '../images/NE.png' || Info.icon == '../images/SW.png' || Info.icon == '../images/SE.png') {
                    marker.getIcon().anchor.x = 22;
                    marker.getIcon().anchor.y = 22;
                }
                else if (Info.icon == '../images/W.png' || Info.icon == '../images/E.png') {

                    marker.getIcon().anchor.x = 9;
                    marker.getIcon().anchor.y = 12;
                }
                else {
                    marker.getIcon().anchor.x = 12;
                    marker.getIcon().anchor.y = 12;
                }
            }

            /*******************Zoom the map according to the vehicle movement*******************************/
            if (that.idx % 10 == 0) {
                count += 1;
                CanZoom = true;
                if (that.idx != 0) {
                    startCount += 10;
                }
                else {
                    walker.clearAlarms();
                }
            }
            else {
                CanZoom = false;
            }

            if (that.idx != path.length - 1) {
                if (CanZoom) {
                    var latlng = PlayBackZoom.slice(startCount, 10 * count);
                    var RouteMovement = new google.maps.LatLngBounds();

                    try {
                        for (var i = 0; i < latlng.length; i++) {
                            RouteMovement.extend(latlng[i]);
                        }
                    }
                    catch (ex) {
                    }

                    map.fitBounds(RouteMovement);
                    //map.zoomTo(new nokia.maps.map.Polyline(RouteMovement).getBoundingBox(), false, "constantvelocity");
                    //if (map.zoomLevel > 17) map.setZoomLevel(map.zoomLevel - 1);
                }
            }
            else {
                map.fitBounds(collectdataPlayback);
                //map.zoomTo(route.getBoundingBox(), false, "constantvelocity");
            }
            /*********************************************************************************************/

            // Force immediate re-render of the map
            //map.update(-0, true);


            /****Play Event****/
            // If we get to the end of the route reverse direction
            if (!that.idx || that.idx === path.length - 1) {
                that.dir *= -1;
                if (that.idx === path.length - 1) {
                    walker.pause();
                    that.dir = -1;
                    that.idx = 0;
                    animate.title = Caption_Play;
                    animate.src = "../images/play.png";
                    //if (bubbles) infoBubble.removeBubble(bubbles);
                    if (infowindow) infowindow.close();
                    walker.ClearSettings();
                    return;
                }
            }
            that.idx += that.dir;

            // Recursively call this function with time that depends on the distance to the next point
            // which makes the marker move in similar random fashion
            //that.timeout = setTimeout(that.walk, Math.round(coord.distance(path.get(that.idx)) * 2.5));
            that.timeout = setTimeout(that.walk, time == null ? mediumSpeed : time);
            that.isWalking = true;
        }

        /****Pause Event****/
        this.pause = function () {
            clearTimeout(that.timeout);
            this.isWalking = false;
        }
        /****Reset Event****/
        this.reset = function () {
            clearTimeout(that.timeout);
            that.idx = 0;
            that.dir = -1;
            this.isWalking = true;
            walker.ClearSettings();
            walker.clearAlarms();
            walker.walk();
        }
        /****stop Event****/
        this.stopplay = function () {
            clearTimeout(that.timeout);
            that.idx = 0;
            that.dir = -1;
            var coord = path[that.idx];
            marker.getIcon().url = iconPlayback;
            marker.setPosition(coord);
            this.isWalking = false;
            if (infowindow) infowindow.close();
            walker.ClearSettings();
            walker.clearAlarms();
            map.fitBounds(collectdataPlayback);
        }
        /****Speed Event****/
        this.Speed = function (playSpeed) {
            time = playSpeed;
        }

        this.ClearSettings = function () {
            count = 0;
            startCount = 0;
            CanZoom = false;
            fast.src = "../images/fast.png";
            medium.src = "../images/medium.png";
            slow.src = "../images/slow.png";
            walker.Speed(slowSpeed);
        }

        this.clearAlarms = function () {
            if (playAlarm.length > 0) {
                for (var k = 0; k < playAlarm.length; k++) {
                    playAlarm[k].setMap(null);
                }
            }
            Array.clear(playAlarm);
        }
    };

    // Constructs Walk object which makes given marker walk along provided path
    walker = new Walker(busMarker, arr);
    if (animate != null && resetPlay != null && stopPlayBack != null) {
        animate.onclick = function () {
            if (walker.isWalking) {
                animate.title = Caption_Play;
                animate.src = "../images/play.png";
                walker.pause();
            } else {
                animate.title = Caption_Pause;
                animate.src = "../images/pause_click.png";
                walker.walk();
            }
        };

        resetPlay.onclick = function () {
            animate.title = Caption_Pause;
            animate.src = "../images/pause_click.png";
            fast.src = "../images/fast.png";
            medium.src = "../images/medium.png";
            slow.src = "../images/slow.png";
            walker.reset();
        };

        stopPlayBack.onclick = function () {
            animate.title = Caption_Play;
            animate.src = "../images/play.png";
            fast.src = "../images/fast.png";
            medium.src = "../images/medium.png";
            slow.src = "../images/slow.png";
            walker.stopplay();
        };

        fast.onclick = function () {
            walker.Speed(fastSpeed);
            fast.src = "../images/fast_click.png";
            medium.src = "../images/medium.png";
            slow.src = "../images/slow.png";
        };
        medium.onclick = function () {
            walker.Speed(mediumSpeed);
            fast.src = "../images/fast.png";
            medium.src = "../images/medium_click.png";
            slow.src = "../images/slow.png";
        };
        slow.onclick = function () {
            walker.Speed(slowSpeed);
            fast.src = "../images/fast.png";
            medium.src = "../images/medium.png";
            slow.src = "../images/slow_click.png";
        };
    }
}

//Plot alarm marker for palyback.
function plotPlaynBackAlarm(bubbleMessage, coord) {

    var icon = new google.maps.MarkerImage("../images/carmarker_Alarm.png",
    new google.maps.Size(26, 40),
                new google.maps.Point(0, 0),
                new google.maps.Point(15, 31));

    var alarmMarker = new google.maps.Marker({
        position: coord,
        icon: icon,
        draggable: false,
        zIndex: 28800001
    });

    //Remove the info bubble on map click.
    google.maps.event.addListener(map, 'click', function (evt) {
        if (infowindow) {
            infowindow.close();
        }
    });

    google.maps.event.addListener(alarmMarker, 'mouseover', function () {
        if (infowindow) {
            infowindow.close();
        }
        infowindow.setContent(bubbleMessage);
        infowindow.open(map, alarmMarker);
    });

    google.maps.event.addListener(alarmMarker, 'mouseout', setTimeout(function () {
        if (infowindow) {
            infowindow.close();
        }
    }, 3000));

    return alarmMarker;
}

//Show hide marker in playback.
function Addcontainer(id) {
    if (id.checked) {
        if (PlaybackMarker.length > 0) {
            for (var k = 0; k < PlaybackMarker.length; k++) {
                PlaybackMarker[k].setMap(map);
            }
        }
    }
    else {
        if (PlaybackMarker.length > 0) {
            for (var k = 0; k < PlaybackMarker.length; k++) {
                PlaybackMarker[k].setMap(null);
            }
        }
    }
}


var Alert_Route = 'No route found for this vehicle.';
function setAlertForRoute(AlertRoute) {
    Alert_Route = (AlertRoute == null || AlertRoute == '') ? Alert_Route : AlertRoute;
}

function capture() {
    var elemt = document.getElementById('map-dsply');
    document.getElementById('hdnCapImage').value = '';
    html2canvas(elemt, {
        useCORS: true,
        optimized: false,
        allowTaint: false,
        onrendered: function (canvas) {
            var tempcanvas = document.createElement('canvas');
            tempcanvas.width = 1250;
            tempcanvas.height = 500;
            var context = tempcanvas.getContext('2d');
            context.drawImage(canvas, 0, 0, 1350, 500, 0, 0, 1350, 500);
            //var link = document.createElement("a");
            //link.href = tempcanvas.toDataURL('image/jpg');
            document.getElementById('hdnCapImage').value = tempcanvas.toDataURL();
            //link.download = 'screenshot.jpg';
            //link.click();
        }
    });
    //useCORS: true,
    //onrendered: function (canvas) {
    //    var img = canvas.toDataURL("image/jpeg,1.0");
    //    document.getElementById('hdnCapImage').value = img;
    //    txt.value = img;
    //} 
}

function mapTypeChoosen() {
    var mapTypeHolder = document.getElementById("hdnMapType");
    if (mapTypeHolder != null) {
        switch (mapTypeHolder.value) {
            case 'N': maptype = map.setMapTypeId(google.maps.MapTypeId.ROADMAP); break;
            case 'S': maptype = map.setMapTypeId(google.maps.MapTypeId.SATELLITE); break;
            case 'H': maptype = map.setMapTypeId(google.maps.MapTypeId.HYBRID); break;
            default: maptype = map.setMapTypeId(google.maps.MapTypeId.TERRAIN); break;
        }
    }
}
/***********************************Maps in Arabic******************************************/
function changeTileProvider(MapType, PasLang) {

    //oldScript = document.getElementById("google-maps-script");
    //oldScript.parentNode.removeChild(oldScript);

    //delete google.maps;

    var scripts = document.querySelectorAll("script[src*='maps.googleapis.com/maps/api/js']");
    for (var i = 0; i < scripts.length; i++) {
        if (i == 4) {
            scripts[i].parentNode.removeChild(scripts[i]);
        }
    }
    if (PasLang == "Ar") {
        Plang = 'ARA';
    }
    else if (PasLang == "hin") { Plang = 'hin'; PasLang = 'hi'; }
    else {
        Plang = 'En';
    }
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?' +
        'callback=load';
    if (PasLang) {
        script.src += '&language=' + PasLang;
    }

    script.id = "google-maps-script";
    document.head.appendChild(script);

    //defaultLayers = platform.createDefaultLayers(256, 72, Plang);

    //switch (MapType) {
    //    case 'N':
    //        mapType = 'N';
    //        map.setBaseLayer(defaultLayers.normal.map);
    //        break;
    //    case 'S':
    //        mapType = 'S';
    //        map.setBaseLayer(defaultLayers.satellite.map);
    //        break;
    //    case 'T':
    //        mapType = 'T';
    //        map.setBaseLayer(defaultLayers.terrain.map);
    //        break;
    //    default:
    //        mapType = 'N';
    //        map.setBaseLayer(defaultLayers.normal.map);
    //        break;
    //}
}
function PlotGeozone(checksts, pageName) {
    if (!checksts) {
        clearPoly_Hstry();
        isShowGeozonePlotter = false;
    }
    else {
        var GeozoneDetails = document.getElementById('hdnGeozoneValue').value;
        var Geozones = GeozoneDetails.split('&');
        var details = "";
        var latlng = "";
        if (GeozoneDetails != "" && GeozoneDetails != null) {
            for (var i = 0; i < Geozones.length; i++) {
                details = Geozones[i].split('|');
                latlng = details[0].replace(/~/gi, "&");
                if (latlng != null && latlng != "") { }
                ShowGeozone_Hstry(latlng, '1', details[1], details[2], details[4], details[3], pageName);
            }
            isShowGeozonePlotter = true;
        }
        else {
            if (pageName == "G") {
                TrinetraCustomAlerts('There is no Geozones available.');
            }
            else {
                TrinetraCustomAlerts('There is no Geozones available in this trip(s).');
            }
            isShowGeozonePlotter = false;
        }
    }

}

var GeozoneCircles = new Array();
var RecGeozone = new Array();
var PolyGeozone = new Array();
function ShowGeozone_Hstry(latlng, isView, geoName, geoType, isRestricted, cRadius, pageName) {
    if (geoType == 1) {
        var isIE = CheckBrowser();
        isview = isView;
        sGeoName = geoName;
        Geozonetype = 'RC';
        var collectdata = new Array();
        var lt = latlng.split('&');
        for (var i = 0; i < lt.length; i++) {
            var lng;
            lng = lt[i].split('#');
            //polyPoints.push(new H.geo.Point(parseFloat(lng[0]), parseFloat(lng[1])));
            var point = new google.maps.LatLng(parseFloat(lng[0]), parseFloat(lng[1]));
            //new google.maps.LatLng(lng[0].replace("(", " "), lng[1].replace(")", ""));
            mapClickRectangle('', point, sGeoName);
        }
    }
    else if (geoType == 2) {
        var isIE = CheckBrowser();
        isview = isView;
        sGeoName = geoName;
        Geozonetype = 'PL';
        var collectdata = new Array();
        var lt = latlng.split('&');
        //polyStrip = new H.geo.Strip();
        for (var i = 0; i < lt.length; i++) {
            var lng;
            lng = lt[i].split('#');
            //var point = new google.maps.LatLng(parseFloat(lng[0]), parseFloat(lng[1]));
            polyPoints.push(new google.maps.LatLng(parseFloat(lng[0]), parseFloat(lng[1])));
            //polyStrip.pushPoint(point);
        }
        drawPoly_hstry(polyPoints, isRestricted, pageName, sGeoName);
        polyPoints.length = 0;
    }
    else if (geoType == 3) {
        var isIE = CheckBrowser();
        isview = isView;
        sGeoName = geoName;
        Geozonetype = 'CR';
        var collectdata = new Array();
        var lt = latlng.split('&');
        for (var i = 0; i < lt.length; i++) {
            var lng;
            lng = lt[i].split('#');
            var point = new google.maps.LatLng(parseFloat(lng[0]), parseFloat(lng[1]));
            doDrawCircle_gz(point, parseFloat(lng[0]), parseFloat(lng[1]), isRestricted, cRadius, pageName, sGeoName);
        }

    }
}

function doDrawCircle_gz(centerPoint, lat, long, isRestricted, circleRadius, pageName, CircGeoName) {
    //if (circle && canClearCircle) {
    //    circle.setMap(null);
    //}
    var center = map.getCenter();
    var bounds = new google.maps.LatLngBounds();

    var radius = parseInt(circleRadius);
    var populationOptions = ({
        strokeColor: "rgba(144,238,144, 0.5)",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "rgba(5,45,0,1)",
        fillOpacity: 0.25,
        center: centerPoint,
        radius: radius
    });
    circle = new google.maps.Circle(populationOptions);
    google.maps.event.addListener(circle, 'click', function (evt) {
        if (infowindow) {
            infowindow.close();
        }
        infoWindow.setContent("<b>Geozone: </b></br>" + CircGeoName);
        infoWindow.setPosition(evt.latLng);
        infoWindow.open(map);
    });
    circle.setMap(map);
    GeozoneCircles.push(circle);
    //map.fitBounds(circle.getBounds())
    //marker.setMap(map);  
}

var r1 = null;
var r2 = null;
var myrectangle;
Rec_bounds = new google.maps.LatLngBounds();
function mapClickRectangle(overlay, point, RectGeoName) {
    if (point == null) { return; }

    if (!r1) {   // First click
        r1 = point;
        //if (myrectangle) myrectangle.setMap(null);
        myrectangle = null;
        //dragRectangle = true;
    }
    else {
        draw_rectangle(r1, point, RectGeoName);
        r2 = point;
        Rec_bounds.extend(r1);
        Rec_bounds.extend(r2);
        r1 = ''
        r2 = ''
        map.fitBounds(Rec_bounds);
    }
}
function draw_rectangle(a, b, RectGeoName) {
    //if (myrectangle != null) {
    //    myrectangle.setMap(null);  //map.removeOverlay(myrectangle);
    //}

    var rec = new google.maps.LatLngBounds();
    rec.extend(a);
    rec.extend(b);
    if (a != null && b != null) {

        myrectangle = new google.maps.Rectangle();
        var rectOptions = {
            strokeColor: "rgba(0,0,128,1)",
            strokeOpacity: 0.4,
            strokeWeight: 2,
            fillColor: "rgba(65, 105, 225, 0.5)",
            fillOpacity: 0.4,
            bounds: rec
            //editable: IsEditable
        };
        myrectangle.setOptions(rectOptions);
        infoWindow = new google.maps.InfoWindow();
        google.maps.event.addListener(myrectangle, 'click', function (evt) {
            if (infowindow) {
                infowindow.close();
            }
            infoWindow.setContent("<b>Geozone: </b></br>" + RectGeoName);
            infoWindow.setPosition(evt.latLng);
            infoWindow.open(map);
        });
        myrectangle.setMap(map);
        RecGeozone.push(myrectangle);

    }
}
function drawPoly_hstry(polyPoints, isRestricted, pageName, geoName) {
    var polyOptions = {
        strokeColor: "rgba(144,238,144, 0.5)",
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: "rgba(5,45,0,1)",
        fillOpacity: 0.3,
        path: polyPoints
    }
    polyShape = new google.maps.Polygon(polyOptions);
    infoWindow = new google.maps.InfoWindow();
    google.maps.event.addListener(polyShape, 'click', function (evt) {
        if (infowindow) {
            infowindow.close();
        }
        infoWindow.setContent("<b>Geozone: </b></br>" + geoName);
        infoWindow.setPosition(evt.latLng);
        infoWindow.open(map);
    });
    polyShape.setMap(map);
    PolyGeozone.push(polyShape);
}

function clearPoly_Hstry() {
    polyPoints.length = 0;
    //r1 = null;
    if (circle) circle.setMap(null);
    circle = null;
    for (var c = 0; c < GeozoneCircles.length; c++) {

        GeozoneCircles[c].setMap(null);
    }
    GeozoneCircles.splice(c, 1);

    if (myrectangle) myrectangle.setMap(null);
    myrectangle = null;
    for (var R = 0; R < RecGeozone.length; R++) {

        RecGeozone[R].setMap(null);
    }
    RecGeozone.splice(R, 1);

    if (polyShape) polyShape.setMap(null);
    polyShape = null;
    for (var p = 0; p < PolyGeozone.length; p++) {

        PolyGeozone[p].setMap(null);
    }
    PolyGeozone.splice(p, 1);

}
/***********************************************************************************************/