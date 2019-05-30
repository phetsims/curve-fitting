// Copyright 2015-2019, University of Colorado Boulder

/**
 * A barometer superclass that is extended by BarometerR2Node and BarometerX2Node
 * Provides most of the base functionality for what a barometer node does
 *
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Text = require( 'SCENERY/nodes/Text' );

  // constants
  const LINE_OPTIONS = {
    lineWidth: 1.5,
    stroke: 'black'
  };

  class BarometerNode extends Node {

    /**
     * @param {Property.<number>} fillProportionProperty - how much the barometer should be filled in a scale from 0 to 1
     * @param {Property.<boolean>} fillVisibleProperty - property that controls whether the fill of the barometer is visible
     * @param {Object.<number, string>} tickLocationToLabels - a map of tick location from 0 to 1 to the corresponding label
     * @param {Object} [options]
     */
    constructor( fillProportionProperty, fillVisibleProperty, tickLocationToLabels, options ) {

      options = _.extend( {

        // {ColorDef} the color of the barometer's fill
        fill: '#fff',

        // {Font} the font of the tick labels
        font: new PhetFont( 12 ),

        // {number} how tall this barometer is
        axisHeight: CurveFittingConstants.BAROMETER_AXIS_HEIGHT,

        // {number} how wide the ticks are
        tickWidth: CurveFittingConstants.BAROMETER_TICK_WIDTH
      }, options );

      super( options );

      // makes the fill rectangle and the axis and adds them to this barometer node
      const valueRectangle = new Rectangle( 0, 0, CurveFittingConstants.BAROMETER_BAR_WIDTH, 0, {
        fill: options.fill
      } );
      valueRectangle.rotation = Math.PI;
      const axisLine = new Line( 0, 0, 0, -options.axisHeight, LINE_OPTIONS );
      this.addChild( valueRectangle );
      this.addChild( axisLine );
      valueRectangle.left = axisLine.right;

      // makes a line at the bottom of the barometer
      const baseLine = new Line( -5, 0, CurveFittingConstants.BAROMETER_BAR_WIDTH + 5, 0, LINE_OPTIONS );
      this.addChild( baseLine );

      // links the valueRectangle's properties to the relevant listeners
      const valueRectangleHeightSetter = fillProportion => {
        valueRectangle.setRectHeight( fillProportion * options.axisHeight );
      };
      fillProportionProperty.link( valueRectangleHeightSetter );
      const fillVisiblePropertyLinkHandle = fillVisibleProperty.linkAttribute( valueRectangle, 'visible' );

      // @private {Function}
      this.disposeListeners = () => {
        fillProportionProperty.unlink( valueRectangleHeightSetter );
        fillVisibleProperty.unlinkAttribute( fillVisiblePropertyLinkHandle );
      };

      // adds ticks for each tick location key in the tickLocationToLabels parameter
      Object.keys( tickLocationToLabels ).forEach( tickLocation => {
        const tickLine = new Line(
          -5,
          -tickLocation * options.axisHeight,
          options.tickWidth - 5,
          -tickLocation * options.axisHeight,
          LINE_OPTIONS
        );
        this.addChild( tickLine );

        const tickLabel = new Text( tickLocationToLabels[ tickLocation ], {
          font: options.font,
          right: tickLine.left - 2,
          centerY: tickLine.centerY
        } );
        this.addChild( tickLabel );
      } );

    }

    /**
     * @override
     * @public
     */
    dispose() {
      this.disposeListeners();
      super.dispose();
    }

  }

  curveFitting.register( 'BarometerNode', BarometerNode );

  return BarometerNode;
} );