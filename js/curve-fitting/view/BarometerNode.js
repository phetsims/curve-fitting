// Copyright 2019-2022, University of Colorado Boulder

/**
 * A barometer superclass that is extended by BarometerR2Node and BarometerX2Node
 * Provides most of the base functionality for what a barometer node does
 *
 * @author Saurabh Totey
 */

import merge from '../../../../phet-core/js/merge.js';
import { Line, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingConstants from '../CurveFittingConstants.js';

// constants
const LINE_OPTIONS = {
  lineWidth: 1.5,
  stroke: 'black'
};

class BarometerNode extends Node {

  /**
   * @param {Property.<number>} fillProportionProperty - how much the barometer should be filled in a scale from 0 to 1
   * @param {Property.<boolean>} fillVisibleProperty - Property that controls whether the fill of the barometer is visible
   * @param {Object.<number, string>} tickPositionToLabels - a map of tick position from 0 to 1 to the corresponding label text
   * @param {Object} [options]
   */
  constructor( fillProportionProperty, fillVisibleProperty, tickPositionToLabels, options ) {

    options = merge( {

      // {ColorDef} the color of the barometer's fill
      fill: '#fff',

      // {Font} the font of the tick labels
      font: CurveFittingConstants.BAROMETER_TICK_LABEL_FONT,

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

    // links the valueRectangle's properties to the relevant listeners; unlinks unnecessary, instances present for sim life
    fillProportionProperty.link( fillProportion => {
      valueRectangle.setRectHeight( fillProportion * options.axisHeight );
    } );
    fillVisibleProperty.linkAttribute( valueRectangle, 'visible' );

    // adds ticks for each tick position key in the tickPositionToLabels parameter
    Object.keys( tickPositionToLabels ).forEach( tickPosition => {
      const tickLine = new Line(
        -5,
        -tickPosition * options.axisHeight,
        options.tickWidth - 5,
        -tickPosition * options.axisHeight,
        LINE_OPTIONS
      );
      this.addChild( tickLine );

      const tickLabel = new Text( tickPositionToLabels[ tickPosition ], {
        font: options.font,
        right: tickLine.left - 2,
        centerY: tickLine.centerY
      } );
      this.addChild( tickLabel );
    } );

  }

}

curveFitting.register( 'BarometerNode', BarometerNode );
export default BarometerNode;
