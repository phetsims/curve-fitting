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
  var FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @param {Property} orderOfFitProperty - Property to control curve type.
   * @param {Property} fitTypeProperty - Property to control fit type.
   * @param {number} maxFitOrder - Max order of fit.
   * @constructor
   */
  function Curve( orderOfFitProperty, fitTypeProperty, maxFitOrder ) {
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

    // save link to property
    this._orderOfFit = orderOfFitProperty;
    this._fitType = fitTypeProperty;

    // points for plotting curve
    this.points = new ObservableArray();

    // special object to getting fit for points
    this.fitMaker = new FitMaker( maxFitOrder );

    this._updateFitBinded = this.updateFit.bind( this );

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

    this._storage = { a: 0, b: 0, c: 0, d: 0 };
    fitTypeProperty.lazyLink( function( fitTypeNew, fitTypePrev ) {
      if ( fitTypeNew === FitType.BEST ) {
        self.swapValueFromStorage();
        self.updateCurveTrigger = !self.updateCurveTrigger;

        // remove update listeners for parameters
        if ( fitTypePrev === FitType.ADJUSTABLE ) {
          self.aProperty.unlink( self._updateFitBinded );
          self.bProperty.unlink( self._updateFitBinded );
          self.cProperty.unlink( self._updateFitBinded );
          self.dProperty.unlink( self._updateFitBinded );
        }
      }
      else if ( fitTypeNew === FitType.ADJUSTABLE ) {
        self.swapValueFromStorage();
        self.updateCurveTrigger = !self.updateCurveTrigger;

        // add update listeners for parameters
        self.aProperty.lazyLink( self._updateFitBinded );
        self.bProperty.lazyLink( self._updateFitBinded );
        self.cProperty.lazyLink( self._updateFitBinded );
        self.dProperty.link( self._updateFitBinded );
      }
    } );
  }

  return inherit( PropertySet, Curve, {

    swapValueFromStorage: function() {
      var storedValue = this._storage.a;
      this._storage.a = this.a;
      this.a = storedValue;

      storedValue = this._storage.b;
      this._storage.b = this.b;
      this.b = storedValue;

      storedValue = this._storage.c;
      this._storage.c = this.c;
      this.c = storedValue;

      storedValue = this._storage.d;
      this._storage.d = this.d;
      this.d = storedValue;
    },

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
        if ( this._fitType.value === FitType.BEST ) {
          var fit = this.fitMaker.getFit( this.points.getArray(), this._orderOfFit.value );

          this.d = fit[ 0 ];
          this.c = fit[ 1 ];
          this.b = fit[ 2 ];
          this.a = fit[ 3 ];
        }

        this.updateCurveTrigger = !this.updateCurveTrigger;
      }
    }
  } );
} );