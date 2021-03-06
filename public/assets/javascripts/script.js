app = angular.module('ngBlog', ['ngResource', 'ngRoute'])

app.config(function($routeProvider) {
  $routeProvider
    .when('/posts',
      {
        templateUrl: '/assets/templates/posts/index.html',
        controller: 'postsCtrl',
        controllerAs: 'ctrl',
        reloadOnSearch: false
      }
    )
    .when('/posts/new',
      {
        templateUrl: '/assets/templates/posts/form.html',
        controller: 'postFormCtrl',
        controllerAs: 'ctrl',
        reloadOnSearch: false
      }
    )
    .when('/posts/:postId',
      {
        templateUrl: '/assets/templates/posts/show.html',
        controller: 'postDetailsCtrl',
        controllerAs: 'ctrl',
        reloadOnSearch: false
      }
    )
    .when('/posts/:postId/edit',
      {
        templateUrl: '/assets/templates/posts/form.html',
        controller: 'postFormCtrl',
        controllerAs: 'ctrl',
        reloadOnSearch: false
      }
    )
    .otherwise({redirectTo: '/posts'})
});

app.config(function($locationProvider) { $locationProvider.hashPrefix('!')})

app.factory('Post', function($resource, $q) {
  var resource = $resource('posts/:id/:action.json',
    {id: '@id', action: '@action'}, {
        update: {method:'PUT'}
    });

  var builtInDelete = resource.prototype.$delete

  resource.prototype.$delete = function() {
    var deferred = $q.defer()
    var confirmed  = confirm('Are you sure you want to delete the post titled "' + this.title + '"?')
    if (confirmed == true) {
      deferred.resolve(builtInDelete.apply(this, arguments))
    } else {
      deferred.reject('cancelled by user')
    }

    return deferred.promise
  }

  return resource;
});

app.controller('postDetailsCtrl', function($scope, $routeParams, Post) {
  var ctrl = this;

  Post.get({id: $routeParams.postId}, function(post) {
    $scope.post = post
  })
})

app.controller('postFormCtrl', function($scope, $routeParams, $location, Post) {
  var ctrl = this;
  var id;

  if ($routeParams.postId) {
    id = $routeParams.postId
  } else {
    id = 'new'
  }

  Post.get({id: id}, function(post) {
    $scope.post = post
  })

  this.saveOrUpdate = function() {
    method = '$save';

    if ($scope.post.id) { method = '$update' }

    $scope.post[method]().then(function(post) {
      if (id == 'new') {
        $location.path("/posts/" + post.id)
      }
    });
  }
})

app.controller('postsCtrl', function($scope, Post) {
  var ctrl = this;

  this.init = function() {
    ctrl.refreshPosts();
  }

  this.refreshPosts = function() {
    Post.query(function(posts) {
      $scope.posts = posts;
    });
  }

  this.destroy = function(post) {
    post.$delete().then(function() {
      ctrl.refreshPosts()
    })
  }

  ctrl.init();
});
