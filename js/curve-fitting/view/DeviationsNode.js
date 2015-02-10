// Copyright 2002-2014, University of Colorado Boulder

/**
 * Deviations node in 'Curve Fitting' simulation.
 * Contains X^2 barometer, r^2 barometer and menu dialog.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var BarometerR2Node = require( 'CURVE_FITTING/curve-fitting/view/BarometerR2Node' );
  var BarometerX2Node = require( 'CURVE_FITTING/curve-fitting/view/BarometerX2Node' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  //var Dialog = require( 'JOIST/Dialog' );
  var ExpandCollapseButton = require( 'SUN/ExpandCollapseButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Util = require( 'DOT/Util' );

  // strings
  var deviationsString = require( 'string!CURVE_FITTING/deviations' );

  // constants
  var BUTTON_LENGTH = 16;
  var TEXT_FONT = new PhetFont( 12 );
  var VALUE_PANEL_OPTIONS = {
    fill: 'white',
    cornerRadius: 4,
    xMargin: 3,
    yMargin: 3,
    resize: false
  };
  var PANEL_OPTIONS = {
    cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
    fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR
  };

  /**
   * @param {Property.<boolean>} isDeviationPanelExpandedProperty - Property to control deviation panel expansion.
   * @param {Property.<number>} chiSquareProperty - Property that represents x-deviation.
   * @param {Property.<string>} chiFillProperty - Property that represent color of x^2 barometer.
   * @param {Property.<number>} rSquareProperty - Property that represents r-deviation.
   * @param {Object} options for graph node
   * @constructor
   */
  function DeviationsNode( isDeviationPanelExpandedProperty, chiSquareProperty, chiFillProperty, rSquareProperty, options ) {

    // create expand button
    var expandCollapseButton = new ExpandCollapseButton( isDeviationPanelExpandedProperty, {
      sideLength: BUTTON_LENGTH
    } );
    expandCollapseButton.touchArea = expandCollapseButton.localBounds.dilatedXY( BUTTON_LENGTH, BUTTON_LENGTH );
    expandCollapseButton.mouseArea = expandCollapseButton.localBounds.dilatedXY( BUTTON_LENGTH, BUTTON_LENGTH );

    // X^2 barometer
    var BarometerX2 = new BarometerX2Node( chiSquareProperty, chiFillProperty );

    // r^2 barometer
    var BarometerR2 = new BarometerR2Node( rSquareProperty );

    // TODO: help dialog window
    /* var dialogHelpNode = new Dialog(
     new Rectangle( 0, 0, 50, 20, 4, 4, { fill: 'white', stroke: 'black', lineWidth: 1 } ),
     {
     modal: true,
     hasCloseButton: false
     } );
     this.addChild( dialogHelpNode );*/

    // help menu button
    var helpButtonNode = new TextPushButton( '?', {
      font: TEXT_FONT,
      baseColor: 'rgb( 204, 204, 204 )'
    } );

    // title
    var titleNode = new Text( deviationsString, { font: TEXT_FONT } );

    var deviationArrowsNode = new HBox( {
      align: 'top',
      spacing: 5,
      children: [ expandCollapseButton, BarometerX2, BarometerR2 ]
    } );

    // create chiSquare text and panel
    var chiSquareTextNode = new Text( '00.00', { font: TEXT_FONT } );
    var chiSquarePanelNode = new Panel( chiSquareTextNode, VALUE_PANEL_OPTIONS );

    // create rSquare text and panel
    var rSquareTextNode = new Text( '0.00', { font: TEXT_FONT } );
    var rSquarePanelNode = new Panel( rSquareTextNode, VALUE_PANEL_OPTIONS );

    var deviationTextNode = new HBox( {
      spacing: 5,
      resize: false,
      children: [
        new SubSupText( 'X<sup>2</sup>=', { font: TEXT_FONT } ),
        chiSquarePanelNode,

        new SubSupText( 'r<sup>2</sup>=', { font: TEXT_FONT } ),
        rSquarePanelNode
      ]
    } );

    var content = new VBox( _.extend( { align: 'left' }, options ) );

    isDeviationPanelExpandedProperty.link( function( isDeviationPanelExpanded ) {
      if ( isDeviationPanelExpanded ) {
        deviationArrowsNode.children = [ expandCollapseButton, BarometerX2, BarometerR2 ];
        content.children = [ deviationArrowsNode, deviationTextNode, helpButtonNode ];
      }
      else {
        deviationArrowsNode.children = [ expandCollapseButton, titleNode ];
        content.children = [ deviationArrowsNode ];
      }
    } );

    chiSquareProperty.link( function( chiSquare ) {
      chiSquareTextNode.setText( Util.toFixedNumber( chiSquare, 2 ).toString() );
      chiSquareTextNode.centerX = chiSquarePanelNode.width / 2;
    } );

    rSquareProperty.link( function( rSquare ) {
      rSquareTextNode.setText( Util.toFixedNumber( rSquare, 2 ).toString() );
      rSquareTextNode.centerX = rSquarePanelNode.width / 2;
    } );

    Panel.call( this, content, PANEL_OPTIONS );
  }

  return inherit( Panel, DeviationsNode );
} );