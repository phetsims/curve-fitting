// Copyright 2015-2017, University of Colorado Boulder

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
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Points = require( 'CURVE_FITTING/curve-fitting/model/Points' );
  const Property = require( 'AXON/Property' );

  // constants
  const VALID_FIT_VALUES = [ 'best', 'adjustable' ];

  class CurveFittingModel {

    /**
     * @constructor
     */
    constructor() {

      // @public {Property.<number>} order of the polynomial that describes the curve, valid values are 1, 2, 3
      this.orderProperty = new NumberProperty( 1 );

      // @public {Property.<string>}, the method of fitting the curve to data points, see VALID_FIT_VALUES
      this.fitProperty = new Property( 'best' );

      // @public {Property.<number>[]}, user input values for coefficients of the polynomial, starting from lowest order x^0 to x^3
      this.sliderPropertyArray = [
        new NumberProperty( CurveFittingConstants.CONSTANT_RANGE.defaultValue ),
        new NumberProperty( CurveFittingConstants.LINEAR_RANGE.defaultValue ),
        new NumberProperty( CurveFittingConstants.QUADRATIC_RANGE.defaultValue ),
        new NumberProperty( CurveFittingConstants.CUBIC_RANGE.defaultValue )
      ];

      // @public - Points for plotting curve. This includes points that are outside the bounds of the graph, so
      // be careful to call getPointsOnGraph when using points in calculations. Order of the points doesn't matter.
      this.points = new Points();

      // @public - the model of the curve
      this.curve = new Curve( this.points, this.sliderPropertyArray, this.orderProperty, this.fitProperty );

      // validate Property values and update curve fit
      this.orderProperty.link( order => {
        // ensure the order is 1, 2 or 3: linear, quadratic or cubic
        assert && assert( order === 1 || order === 2 || order === 3, 'invalid order: ' + order );
        this.curve.updateFit();
      } );
      this.fitProperty.link( fit => {
        assert && assert( _.includes( VALID_FIT_VALUES, fit ), 'invalid fit: ' + fit );
        this.curve.updateFit();
      } );

      // a change of any of the value sliders force an update of the curve model
      this.sliderPropertyArray.forEach( sliderProperty => {
        sliderProperty.link( () => { this.curve.updateFit(); } );
      } );

      // Add internal listeners for adding and removing points
      this.points.addItemAddedListener( point => {
        this.addPoint( point );
      } );
      this.points.addItemRemovedListener( point => {
        this.removePoint( point );
      } );

      // @private
      this.updateFitBound = this.curve.updateFit.bind( this.curve );
    }

    /**
     * Resets the model
     * @public
     */
    reset() {
      this.sliderPropertyArray.forEach( sliderProperty => {
        sliderProperty.reset();
      } );
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
      point.positionProperty.link( this.updateFitBound );
      point.isInsideGraphProperty.link( this.updateFitBound );
      point.deltaProperty.link( this.updateFitBound );

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
      point.positionProperty.unlink( this.updateFitBound );
      point.isInsideGraphProperty.unlink( this.updateFitBound );
      point.deltaProperty.unlink( this.updateFitBound );

      this.curve.updateFit();
    }

  }

  curveFitting.register( 'CurveFittingModel', CurveFittingModel );

  return CurveFittingModel;
} );