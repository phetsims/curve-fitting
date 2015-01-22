// Copyright 2002-2014, University of Colorado Boulder

/**
 * Curve model.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var CurveType = require( 'CURVE_FITTING/curve-fitting/model/CurveType' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @param {Property} curveTypeProperty - Property for
   * @constructor
   */
  function Curve( curveTypeProperty ) {
    var self = this;

    PropertySet.call( this, {
      a: 0, // parameter with x^3
      b: 0, // parameter with x^2
      c: 0, // parameter with x^1
      d: 0  // parameter with constant
    } );

    curveTypeProperty.lazyLink( function( curveType ) {
      if ( curveType === CurveType.LINEAR ) {
        self.a = 0;
        self.b = 0;
      }
      else if ( curveType === CurveType.QUADRATIC ) {
        self.a = 0;
      }
    } );
  }

  return inherit( PropertySet, Curve );
} );