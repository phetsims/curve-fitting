// Copyright 2015-2019, University of Colorado Boulder

/**
 * Model container for 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( require => {
  'use strict';

  // modules
  const Curve = require( 'CURVE_FITTING/curve-fitting/model/Curve' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Points = require( 'CURVE_FITTING/curve-fitting/model/Points' );
  const Property = require( 'AXON/Property' );

  class CurveFittingModel {

    /**
     * @constructor
     */
    constructor() {

      // @public {Property.<number>} order of the polynomial that describes the curve, valid values are 1, 2, 3
      this.orderProperty = new NumberProperty( 1 );

      // @public {Property.<FitType>}, the method of fitting the curve to data points
      this.fitProperty = new Property( FitType.BEST, { validValues: FitType.VALUES } );

      // @public {Property.<number>[]}, user input values for coefficients of the polynomial, starting from lowest order x^0 to x^3
      this.sliderPropertyArray = [
        new NumberProperty( CurveFittingConstants.CONSTANT_RANGE.defaultValue ),
        new NumberProperty( CurveFittingConstants.LINEAR_RANGE.defaultValue ),
        new NumberProperty( CurveFittingConstants.QUADRATIC_RANGE.defaultValue ),
        new NumberProperty( CurveFittingConstants.CUBIC_RANGE.defaultValue )
      ];

      // @public {Points} - Points for plotting curve. This includes points that are outside the bounds of the graph, so
      // be careful to call getRelevantPoints when using points in calculations. Order of the points doesn't matter.
      this.points = new Points();

      // @public {Curve} - the model of the curve
      this.curve = new Curve( this.points, this.sliderPropertyArray, this.orderProperty, this.fitProperty );

      // @private {Function}
      this.updateCurveFit = () => { this.curve.updateFit(); };

      // validate Property values and update curve fit
      this.orderProperty.link( order => {

        // ensure the order is 1, 2 or 3: linear, quadratic or cubic
        assert && assert( order === 1 || order === 2 || order === 3, `invalid order: ${order}` );
        this.updateCurveFit();
      } );
      this.fitProperty.link( this.updateCurveFit );

      // a change of any of the value sliders force an update of the curve model
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
        this.points.remove( point );
        point.returnToOriginEmitter.removeListener( removePointListener );
      };

      // remove points when they have returned to the bucket
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

  return CurveFittingModel;
} );