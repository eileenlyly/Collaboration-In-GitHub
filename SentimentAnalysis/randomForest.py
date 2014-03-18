import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score
from sklearn.cross_validation import cross_val_score
import numpy as np

os.chdir('/Users/eileenlyly/courses/ECS289L/github_data/comments')

#akka data
akka_data = np.loadtxt('akka.csv',dtype=np.object,delimiter=',')
akka_classes = np.ravel(akka_data[:,0:1]).astype(np.int)
akka_predictors = akka_data[:,1:].astype(np.float)

akka_data_new = np.loadtxt('akka_other.csv',dtype=np.object,delimiter=',')
akka_classes_new = np.ravel(akka_data_new[:,0:1]).astype(np.int)
akka_predictors_new = akka_data_new[:,1:].astype(np.float)

akka_clf = RandomForestClassifier()
akka_clf.fit(akka_predictors, akka_classes)
akka_classes_pdkt = akka_clf.predict(akka_predictors_new)
akka_scores = cross_val_score(akka_clf, akka_predictors, akka_classes)
akka_importances = akka_clf.feature_importances_

akka_acc_score = accuracy_score(akka_classes_new,akka_classes_pdkt)
akka_prc_score = precision_score(akka_classes_new,akka_classes_pdkt)

homebrew_akka_classes_pdkt = akka_clf.predict(homebrew_predictors_new)
homebrew_akka_acc_score = accuracy_score(homebrew_classes_new,homebrew_akka_classes_pdkt)
print homebrew_akka_acc_score

akka_homebrew_classes_pdkt = homebrew_clf.predict(akka_predictors_new)
akka_homebrew_acc_score = accuracy_score(akka_classes_new,akka_homebrew_classes_pdkt)
print akka_homebrew_acc_score

# Homebrew data
homebrew_data = np.loadtxt('homebrew.csv',dtype=np.object,delimiter=',')
homebrew_classes = np.ravel(homebrew_data[:,0:1]).astype(np.int)
homebrew_predictors = homebrew_data[:,1:].astype(np.float)

homebrew_data_new = np.loadtxt('homebrew_other.csv',dtype=np.object,delimiter=',')
homebrew_classes_new = np.ravel(homebrew_data_new[:,0:1]).astype(np.int)
homebrew_predictors_new = homebrew_data_new[:,1:].astype(np.float)

homebrew_clf = RandomForestClassifier()
homebrew_clf.fit(homebrew_predictors, homebrew_classes)
homebrew_classes_pdkt = homebrew_clf.predict(homebrew_predictors_new)
homebrew_scores = cross_val_score(homebrew_clf, homebrew_predictors, homebrew_classes)
homebrew_importances = homebrew_clf.feature_importances_

homebrew_acc_score = accuracy_score(homebrew_classes_new,homebrew_classes_pdkt)
homebrew_prc_score = precision_score(homebrew_classes_new,homebrew_classes_pdkt)


# Reddit data
reddit_data = np.loadtxt('reddit.csv',dtype=np.object,delimiter=',')
reddit_classes = np.ravel(reddit_data[:,0:1]).astype(np.int)
reddit_predictors = reddit_data[:,1:].astype(np.float)

reddit_clf = RandomForestClassifier()
reddit_clf.fit(reddit_predictors, reddit_classes)
reddit_clf.predict(reddit_predictors)
reddit_scores = cross_val_score(reddit_clf, reddit_predictors, reddit_classes)
reddit_importances = reddit_clf.feature_importances_

# Scala data
scala_data = np.loadtxt('scala.csv',dtype=np.object,delimiter=',')
scala_classes = np.ravel(scala_data[:,0:1]).astype(np.int)
scala_predictors = scala_data[:,1:].astype(np.float)

scala_data_new = np.loadtxt('scala_other.csv',dtype=np.object,delimiter=',')
scala_classes_new = np.ravel(scala_data_new[:,0:1]).astype(np.int)
scala_predictors_new = scala_data_new[:,1:].astype(np.float)

scala_clf = RandomForestClassifier()
scala_clf.fit(scala_predictors, scala_classes)
scala_classes_pdkt = scala_clf.predict(scala_predictors_new)
scala_scores = cross_val_score(scala_clf, scala_predictors, scala_classes)
scala_importances = scala_clf.feature_importances_

scala_acc_score = accuracy_score(scala_classes_new,scala_classes_pdkt)
scala_prc_score = precision_score(scala_classes_new,scala_classes_pdkt)


# node data
node_data = np.loadtxt('node.csv',dtype=np.object,delimiter=',')
node_classes = np.ravel(node_data[:,0:1]).astype(np.int)
node_predictors = node_data[:,1:].astype(np.float)

node_data_new = np.loadtxt('node_other.csv',dtype=np.object,delimiter=',')
node_classes_new = np.ravel(node_data_new[:,0:1]).astype(np.int)
node_predictors_new = node_data_new[:,1:].astype(np.float)

node_clf = RandomForestClassifier()
node_clf.fit(node_predictors, node_classes)
node_classes_pdkt = node_clf.predict(node_predictors_new)
node_scores = cross_val_score(node_clf, node_predictors, node_classes)
node_importances = node_clf.feature_importances_

node_acc_score = accuracy_score(node_classes_new,node_classes_pdkt)
node_prc_score = precision_score(node_classes_new,node_classes_pdkt)


# mongo data
mongo_data = np.loadtxt('mongo.csv',dtype=np.object,delimiter=',')
mongo_classes = np.ravel(mongo_data[:,0:1]).astype(np.int)
mongo_predictors = mongo_data[:,1:].astype(np.float)

mongo_clf = RandomForestClassifier()
mongo_clf.fit(mongo_predictors, mongo_classes)
mongo_clf.predict(mongo_predictors)
mongo_scores = cross_val_score(mongo_clf, mongo_predictors, mongo_classes)
mongo_importances = mongo_clf.feature_importances_


print akka_scores.mean(), akka_importances, akka_acc_score, akka_prc_score
print homebrew_scores.mean(), homebrew_importances, homebrew_acc_score, homebrew_prc_score
print scala_scores.mean(), scala_importances, scala_acc_score, scala_prc_score
print node_scores.mean(), node_importances, node_acc_score, node_prc_score
print reddit_scores.mean(), reddit_importances
print mongo_scores.mean(), mongo_importances



