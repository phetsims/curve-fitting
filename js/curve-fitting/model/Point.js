// Copyright 2015, University of Colorado Boulder

/**
 * Point model in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Vector2} initialPosition - The initial position the point has
   * @constructor
   */
  function Point( initialPosition ) {
    var self = this;
    PropertySet.call( this, {
      isInsideGraph: false, // flag to control graph area affiliation
      position: initialPosition, //initial position of the point at creation
      userControlled: false, // flag that controls if the user grabbed this
      animating: false, // flag to control if it is animating

      delta: 0.8 // delta variation of point
    } );

    // check and set the flag that indicates if the point is above the graph 
    this.positionProperty.link( function() {
      self.isPointPositionOverLappingGraph();
    } );

    //if the user dropped the ball outside of the graph send it back to the bucket
    this.userControlledProperty.lazyLink( function() {
        if ( !self.userControlledProperty.value ) {
          if ( (!self.isInsideGraphProperty.value && !self.animatingProperty.value ) ) {
            self.animate();
          }
        }
      }
    );
  }

  curveFitting.register( 'Point', Point );

  return inherit( PropertySet, Point, {

    /**
     * Function that animates the point back to the bucket
     * @public
     */
    animate: function() {
      var self = this;
      this.animating = true;

      var position = {
        x: this.position.x,
        y: this.position.y
      };

      var distance = this.positionProperty.initialValue.distance( this.position );
      var animationTween = new TWEEN.Tween( position ).to( {
        x: this.positionProperty.initialValue.x,
        y: this.positionProperty.initialValue.y
      }, distance / CurveFittingConstants.ANIMATION_SPEED ).easing( TWEEN.Easing.Cubic.In ).onUpdate( function() {
        self.position = new Vector2( position.x, position.y );
      } ).onComplete( function() {
        self.animating = false;
        self.trigger( 'returnedToOrigin' );
      } );

      animationTween.start();
    },

    /**
     * Determines if the position of a point is within the visual bouynds of the graph
     */
    isPointPositionOverLappingGraph: function() {
      this.isInsideGraphProperty.set( CurveFittingConstants.GRAPH_MODEL_BOUNDS.containsPoint( this.position ) );
    }

  } );
} );