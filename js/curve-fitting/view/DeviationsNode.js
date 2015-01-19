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
  var AccordionBox = require( 'SUN/AccordionBox' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // constants
  var BAROMETER_HEIGHT = 200;
  var BAROMETER_X2_OPTIONS = {
    headHeight: 12,
    headWidth: 8,
    tailWidth: 1
  };
  var TICK_FONT = new PhetFont( 12 );
  var TEXT_FONT = new PhetFont( 16 );
  var TICK_WIDTH = 15;
  var LINE_OPTIONS = {
    lineWidth: 2,
    stroke: 'black'
  };

  /**
   * @param {Object} options for graph node
   * @constructor
   */
  function DeviationsNode( options ) {

    // X^2 barometer
    var BarometerX2 = new Node( {
      children: [
        new ArrowNode( 0, BAROMETER_HEIGHT, 0, 0, BAROMETER_X2_OPTIONS ),

        new Line( 0, BAROMETER_HEIGHT, TICK_WIDTH, BAROMETER_HEIGHT, LINE_OPTIONS ),
        new Text( '0', {font: TICK_FONT, centerX: -8, centerY: BAROMETER_HEIGHT} )
      ]
    } );

    // r^2 barometer
    var BarometerR2 = new Node( {
      children: [
        new Line( 0, BAROMETER_HEIGHT, 0, 0, LINE_OPTIONS ),

        new Line( 0, BAROMETER_HEIGHT, TICK_WIDTH, BAROMETER_HEIGHT, LINE_OPTIONS ),
        new Text( '0', {font: TICK_FONT, centerX: -8, centerY: BAROMETER_HEIGHT} )
      ]
    } );

    AccordionBox.call( this, new VBox( _.extend( {
      align: 'left',
      children: [
        new HBox( {
          spacing: 15,
          children: [BarometerX2, BarometerR2]
        } ),
        new HBox( {
          spacing: 5,
          children: [
            new SubSupText( 'X<sup>2</sup>=', {font: TEXT_FONT} ),
            new Rectangle( 0, 0, 30, 20, 4, 4, {fill: 'white', stroke: 'black', lineWidth: 1} ),
            new SubSupText( 'r<sup>2</sup>=', {font: TEXT_FONT} ),
            new Rectangle( 0, 0, 30, 20, 4, 4, {fill: 'white', stroke: 'black', lineWidth: 1} )
          ]
        } ),
        new TextPushButton( '?', {
          font: TEXT_FONT,
          baseColor: 'rgb( 204, 204, 204 )'
        } )
      ]
    }, options ) ), {
      contentAlign: 'left',
      showTitleWhenExpanded: false,
      fill: 'rgb( 254, 235, 214 )'
    } );
  }

  return inherit( AccordionBox, DeviationsNode );
} );