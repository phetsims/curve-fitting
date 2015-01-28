// Copyright 2002-2014, University of Colorado Boulder

/**
 * Node with fit types and adjusting sliders in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // constants
  var LINE_OPTIONS = {
    lineWidth: 1,
    stroke: 'black'
  };
  var SIZE = new Dimension2( 430, 470 );
  var TICK_LENGTH = 7;

  /**
   * @param {Object} options for graph node
   * @constructor
   */
  function GraphAreaNode( options ) {
    Node.call( this, options );

    // add white background
    this.addChild( new Rectangle( 0, 0, SIZE.width, SIZE.height, { fill: 'white' } ) );

    // add X-axis and ticks
    this.addChild( new Line( 0, SIZE.height / 2, SIZE.width, SIZE.height / 2, LINE_OPTIONS ) );
    this.addChild( new Line( LINE_OPTIONS.lineWidth / 2, SIZE.height / 2 - TICK_LENGTH, LINE_OPTIONS.lineWidth / 2, SIZE.height / 2 + TICK_LENGTH, LINE_OPTIONS ) );
    this.addChild( new Line( SIZE.width / 4, SIZE.height / 2 - TICK_LENGTH, SIZE.width / 4, SIZE.height / 2 + TICK_LENGTH, LINE_OPTIONS ) );
    this.addChild( new Line( 3 * SIZE.width / 4, SIZE.height / 2 - TICK_LENGTH, 3 * SIZE.width / 4, SIZE.height / 2 + TICK_LENGTH, LINE_OPTIONS ) );
    this.addChild( new Line( SIZE.width - LINE_OPTIONS.lineWidth, SIZE.height / 2 - TICK_LENGTH, SIZE.width - LINE_OPTIONS.lineWidth, SIZE.height / 2 + TICK_LENGTH, LINE_OPTIONS ) );

    // add Y-axis
    this.addChild( new Line( SIZE.width / 2, 0, SIZE.width / 2, SIZE.height, LINE_OPTIONS ) );
    this.addChild( new Line( SIZE.width / 2 - TICK_LENGTH, LINE_OPTIONS.lineWidth / 2, SIZE.width / 2 + TICK_LENGTH, LINE_OPTIONS.lineWidth / 2, LINE_OPTIONS ) );
    this.addChild( new Line( SIZE.width / 2 - TICK_LENGTH, SIZE.height / 4, SIZE.width / 2 + TICK_LENGTH, SIZE.height / 4, LINE_OPTIONS ) );
    this.addChild( new Line( SIZE.width / 2 - TICK_LENGTH, 3 * SIZE.height / 4, SIZE.width / 2 + TICK_LENGTH, 3 * SIZE.height / 4, LINE_OPTIONS ) );
    this.addChild( new Line( SIZE.width / 2 - TICK_LENGTH, SIZE.height - LINE_OPTIONS.lineWidth, SIZE.width / 2 + TICK_LENGTH, SIZE.height - LINE_OPTIONS.lineWidth, LINE_OPTIONS ) );
  }

  return inherit( Node, GraphAreaNode );
} );