// Copyright 2017-2022, University of Colorado Boulder

/**
 * Model of the shape of a polynomial curve.
 * Uses linear interpolation to make lines between points.
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 */

import { Shape } from '../../../../kite/js/imports.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingConstants from '../CurveFittingConstants.js';

// constants
// how many segments: more segments means a finer/more accurate curve
const NUMBER_STEPS = 220;

class CurveShape extends Shape {

  /**
   * @param {function(number): number} getYValueAt - a function that gets a Y value for the given X coordinate
   */
  constructor( getYValueAt ) {

    super();

    // model bounds of the graph area
    const graphBounds = CurveFittingConstants.GRAPH_NODE_MODEL_BOUNDS;

    // convenience variables
    const xMin = graphBounds.minX; // minimum value of the x range
    const xMax = graphBounds.maxX; // maximum value of the x range

    // separation between adjacent x coordinates
    const interval = ( xMax - xMin ) / NUMBER_STEPS;

    // move shape to initial position
    this.moveTo( xMin, getYValueAt( xMin ) );

    // create lines connecting each point
    for ( let x = xMin + interval; x <= xMax; x += interval ) {
      const y = getYValueAt( x );
      this.lineTo( x, y );
    }

  }

}

curveFitting.register( 'CurveShape', CurveShape );
export default CurveShape;
