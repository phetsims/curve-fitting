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
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var BarometerR2Node = require( 'CURVE_FITTING/curve-fitting/view/BarometerR2Node' );
  var BarometerX2Node = require( 'CURVE_FITTING/curve-fitting/view/BarometerX2Node' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var ExpandCollapseButton = require( 'SUN/ExpandCollapseButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var deviationsString = require( 'string!CURVE_FITTING/deviations' );

  // constants
  var BAROMETER_HEIGHT = 200;
  var BAROMETER_X2_OPTIONS = {
    headHeight: 12,
    headWidth: 8,
    tailWidth: 1
  };
  var BUTTON_LENGTH = 16;
  var TICK_FONT = new PhetFont( 11 );
  var TEXT_FONT = new PhetFont( 13 );
  var TICK_WIDTH = 15;
  var LINE_OPTIONS = {
    lineWidth: 2,
    stroke: 'black'
  };
  var PANEL_OPTIONS = {
    cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
    fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR
  };

  /**
   * @param {Property} isDeviationPanelExpandedProperty - Property to control deviation panel expansion.
   * @param {Object} options for graph node
   * @constructor
   */
  function DeviationsNode( isDeviationPanelExpandedProperty, options ) {

    // create expand button
    var expandCollapseButton = new ExpandCollapseButton( isDeviationPanelExpandedProperty, {
      sideLength: BUTTON_LENGTH
    } );
    expandCollapseButton.touchArea = expandCollapseButton.localBounds.dilatedXY( BUTTON_LENGTH, BUTTON_LENGTH );
    expandCollapseButton.mouseArea = expandCollapseButton.localBounds.dilatedXY( BUTTON_LENGTH, BUTTON_LENGTH );

    // X^2 barometer
    var BarometerX2 = new BarometerX2Node();

    // r^2 barometer
    var BarometerR2 = new BarometerR2Node();

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
    var deviationTextNode = new HBox( {
      spacing: 5,
      children: [
        new SubSupText( 'X<sup>2</sup>=', { font: TEXT_FONT } ),
        new Rectangle( 0, 0, 25, 18, 4, 4, { fill: 'white', stroke: 'black', lineWidth: 1 } ),
        new SubSupText( 'r<sup>2</sup>=', { font: TEXT_FONT } ),
        new Rectangle( 0, 0, 25, 18, 4, 4, { fill: 'white', stroke: 'black', lineWidth: 1 } )
      ]
    } );

    var content = new VBox( _.extend( {
      align: 'left'
    }, options ) );

    Panel.call( this, content, PANEL_OPTIONS );

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
  }

  return inherit( Panel, DeviationsNode );
} );