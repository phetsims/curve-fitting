// Copyright 2002-2014, University of Colorado Boulder

/**
 * Point model.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {number} x coordinate of point.
   * @param {number} y coordinate of point.
   * @param {Vector2} position - Initial position of point.
   * @constructor
   */
  function Point( x, y, position ) {
    PropertySet.call( this, {
      x: x || 0, // x-coordinate of point
      y: y || 0, // y-coordinate of point
      position: position || new Vector2( 0, 0 ), // position of point
      delta: 0.8 // delta variation of point
    } );
  }

  return inherit( PropertySet, Point, {
    moveTo: function( positionNew ) {
      this.position.set( positionNew );
      this.positionProperty.notifyObserversStatic();
    }
  } );
} );