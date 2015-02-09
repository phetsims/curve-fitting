// Copyright 2002-2014, University of Colorado Boulder

/**
 * Curve model in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var FitMaker = require( 'CURVE_FITTING/curve-fitting/model/FitMaker' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @param {Property} orderOfFitProperty - Property to control curve type.
   * @param {number} maxFitOrder - Max order of fit.
   * @constructor
   */
  function Curve( orderOfFitProperty, maxFitOrder ) {
    var self = this;

    PropertySet.call( this, {
      isVisible: false, // curve flag visibility
      updateCurveTrigger: true,
      a: 0, // parameter with x^3
      b: 0, // parameter with x^2
      c: 0, // parameter with x^1
      d: 0, // parameter with constant
      deviationR: 0, // r-deviation
      deviationX: 0 // x-deviation
    } );

    this.points = new ObservableArray();
    this._orderOfFit = orderOfFitProperty;
    this._updateFitBinded = this.updateFit.bind( this );

    this.fitMaker = new FitMaker( maxFitOrder );

    this.points.addListeners( this.addPoint.bind( this ), this.removePoint.bind( this ) );

    orderOfFitProperty.lazyLink( function( orderOfFit ) {
      if ( orderOfFit === 1 ) {
        self.a = 0;
        self.b = 0;
      }
      else if ( orderOfFit === 2 ) {
        self.a = 0;
      }
    } );

    this.isVisibleProperty.onValue( true, this._updateFitBinded );
    orderOfFitProperty.link( this._updateFitBinded );
  }

  return inherit( PropertySet, Curve, {

    addPoint: function( point ) {
      point.positionProperty.lazyLink( this._updateFitBinded );
      point.deltaProperty.link( this._updateFitBinded );
    },

    removePoint: function( point ) {
      point.positionProperty.unlink( this._updateFitBinded );
      point.deltaProperty.unlink( this._updateFitBinded );
      this.updateFit();
    },

    updateFit: function() {
      // update only when curve visible
      if ( this.isVisible ) {
        var fit = this.fitMaker.getFit( this.points.getArray(), this._orderOfFit.value );

        this.d = fit[ 0 ];
        this.c = fit[ 1 ];
        this.b = fit[ 2 ];
        this.a = fit[ 3 ];

        this.updateCurveTrigger = !this.updateCurveTrigger;
      }
    }
  } );
} );