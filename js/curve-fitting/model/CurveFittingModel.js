// Copyright 2015-2023, University of Colorado Boulder

/**
 * Model container for 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingConstants from '../CurveFittingConstants.js';
import createPoints from './createPoints.js';
import Curve from './Curve.js';
import FitType from './FitType.js';

class CurveFittingModel {

  constructor() {

    // @public {Property.<number>} order of the polynomial that describes the curve, valid values are 1, 2, 3
    this.orderProperty = new NumberProperty( 1, {
      validValues: [ 1, 2, 3 ],
      hasListenerOrderDependencies: true // TODO: https://github.com/phetsims/curve-fitting/issues/169
    } );

    // @public {Property.<FitType>}, the method of fitting the curve to data points
    this.fitProperty = new EnumerationDeprecatedProperty( FitType, FitType.BEST );

    // @public {Property.<number>[]}, user input values for coefficients of the polynomial, starting from lowest
    // order x^0 to x^3
    const makeNumberPropertyFromRange = range => new NumberProperty( range.defaultValue, { range: range } );
    this.sliderPropertyArray = [
      makeNumberPropertyFromRange( CurveFittingConstants.CONSTANT_RANGE ),
      makeNumberPropertyFromRange( CurveFittingConstants.LINEAR_RANGE ),
      makeNumberPropertyFromRange( CurveFittingConstants.QUADRATIC_RANGE ),
      makeNumberPropertyFromRange( CurveFittingConstants.CUBIC_RANGE )
    ];

    // @public {Points} - Points for plotting curve. This includes points that are outside the bounds of the graph,
    // so be careful to call getRelevantPoints when using points in calculations. Order of the points doesn't matter.
    this.points = createPoints();

    // @public {Curve} - the model of the curve
    this.curve = new Curve( this.points, this.sliderPropertyArray, this.orderProperty, this.fitProperty );

    // @private {function}
    this.updateCurveFit = () => { this.curve.updateFit(); };

    // validate Property values and update curve fit; unlink unnecessary present for the lifetime of the sim
    this.orderProperty.link( () => { this.updateCurveFit(); } );

    // unlink unnecessary, present for the lifetime of the sim
    this.fitProperty.link( this.updateCurveFit );

    // a change of any of the value sliders force an update of the curve model
    // unlinks unnecessary: present for lifetime of the sim
    this.sliderPropertyArray.forEach( sliderProperty => {
      sliderProperty.link( this.updateCurveFit );
    } );

    // Add internal listeners for adding and removing points
    this.points.addItemAddedListener( point => { this.addPoint( point ); } );
    this.points.addItemRemovedListener( point => { this.removePoint( point ); } );
  }

  /**
   * Resets the model
   * @public
   */
  reset() {
    this.sliderPropertyArray.forEach( sliderProperty => { sliderProperty.reset(); } );
    this.orderProperty.reset();
    this.fitProperty.reset();
    this.points.reset();
    this.curve.reset();
  }

  /**
   * Adds a point
   *
   * @param {Point} point
   * @private
   */
  addPoint( point ) {

    // These are unlinked in removePoint
    point.positionProperty.link( this.updateCurveFit );
    point.isInsideGraphProperty.link( this.updateCurveFit );
    point.deltaProperty.link( this.updateCurveFit );

    const removePointListener = () => {
      if ( this.points.includes( point ) ) {
        this.points.remove( point );
      }
      point.returnToOriginEmitter.removeListener( removePointListener );
    };

    // remove points when they have returned to the bucket
    // listener removes itself when called
    point.returnToOriginEmitter.addListener( removePointListener );
  }

  /**
   * Removes a point
   *
   * @param {Point} point
   * @private
   */
  removePoint( point ) {

    // These were linked in addPoint
    point.positionProperty.unlink( this.updateCurveFit );
    point.isInsideGraphProperty.unlink( this.updateCurveFit );
    point.deltaProperty.unlink( this.updateCurveFit );

    this.updateCurveFit();
  }

}

curveFitting.register( 'CurveFittingModel', CurveFittingModel );
export default CurveFittingModel;