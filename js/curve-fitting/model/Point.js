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
   * @param {Vector2} position - Initial position vector.
   * @constructor
   */
  function Point( position ) {
    PropertySet.call( this, {
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