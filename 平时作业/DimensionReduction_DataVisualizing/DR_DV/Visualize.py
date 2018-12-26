#coding:utf-8
from time import time
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.axes3d import Axes3D
from sklearn import (manifold,datasets,decomposition,ensemble,random_projection)
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as lda
#加载sklearn中datasets模块的MNIST数据，有5种digits
digits = datasets.load_digits(n_class=5)
X = digits.data
y = digits.target
#(901, 64) 一共901个样本，每张图片的大小是8*8，展开后是64维。
print X.shape
n_img_per_row = 20
img = np.zeros((10 * n_img_per_row,10 * n_img_per_row))
for i in range(n_img_per_row):
	ix = 10 * i + 1
	for j in range(n_img_per_row):
		iy = 10 * j + 1
		img[ix:ix + 8,iy:iy + 8] = X[i * n_img_per_row + j].reshape((8,8))
plt.imshow(img,cmap=plt.cm.binary)
plt.title('A selection from the 64-dimensional digits dataset')

n_neighbors = 30
#二维
def plot_embedding_2d(X,title=None):
	#坐标缩放到[0，1)区间
	x_min,x_max = np.min(X,axis=0),np.max(X,axis=0)
	X = (X - x_min)/(x_max - x_min)
	#降维后坐标为（X[i，0]，X[i，1]），在该位置画出对应的digits
	fig = plt.figure()
	ax = fig.add_subplot(1,1,1)
	for i in range(X.shape[0]):
		ax.text(X[i,0],X[i,1],str(digits.target[i]),
				color = plt.cm.Set1(y[i]/10.),
				fontdict={'weight':'bold','size':9})
	if title is not None:
		plt.title(title)
#三维
def plot_embedding_3d(X,title=None):
	# 坐标缩放到[0，1)区间
	x_min, x_max = np.min(X, axis=0), np.max(X, axis=0)
	X = (X - x_min) / (x_max - x_min)
	# 降维后坐标为（X[i，0]，X[i，1]，X[i，2]），在该位置画出对应的digits
	fig = plt.figure()
	ax = fig.add_subplot(1, 1, 1,projection='3d')
	for i in range(X.shape[0]):
		ax.text(X[i, 0], X[i, 1],X[i,2], str(digits.target[i]),
				color=plt.cm.Set1(y[i] / 10.),
				fontdict={'weight': 'bold', 'size': 9})
	if title is not None:
		plt.title(title)


#线形判别分析（Linear Discriminant Analysis，LDA）从64维降到2，3维
print("Computing LDA projection")
X2 = X.copy()
X2.flat[::X.shape[1] + 1] += 0.01  # Make X invertible
t0 = time()
X_lda = lda(n_components=3).fit_transform(X2,y)
plot_embedding_2d(X_lda[:,0:2],"LDA 2D" )
plot_embedding_3d(X_lda,"LDA 3D (time %.2fs)" %(time() - t0))


#随机映射 n_components=2，从64维降到2维
print("Computing random projection")
rp = random_projection.SparseRandomProjection(n_components=2,random_state=42)
X_projected = rp.fit_transform(X)
plot_embedding_2d(X_projected,"Random Projection")


#主成分分析PCA 从64维降到3维
print("Computing PCA projection")
t0 = time()
X_pca = decomposition.TruncatedSVD(n_components=3).fit_transform(X)
plot_embedding_2d(X_pca[:,0:2],"PCA 2D")
plot_embedding_3d(X_pca,"PCA 3D (time %.2fs)" %(time() -t0))


#等距映射（Isomap）从64维降到2维
print("Computing Isomap embedding")
t0 = time()
X_iso = manifold.Isomap(n_neighbors,n_components=2).fit_transform(X)
print("Done.")
plot_embedding_2d(X_iso,"Isomap (time %.2fs)" %(time() - t0))


#标准版 局部线性嵌入(Locally-linear embedding，LLE)从64维降到2维
print("Computing LLE embedding")
clf = manifold.LocallyLinearEmbedding(n_neighbors,n_components=2,method='standard')
t0 = time()
X_lle = clf.fit_transform(X)
#Done. Reconstruction error: 1.11351e-06
print("Done. Reconstruction error: %g" %clf.reconstruction_error_)
plot_embedding_2d(X_lle,"Locally Linear Embedding (time %.2fs)" %(time() - t0))


#改进版 局部线性嵌入(Locally-linear embedding，LLE)从64维降到2维
print("Computing modified LLE embedding")
clf = manifold.LocallyLinearEmbedding(n_neighbors,n_components=2,method='modified')
t0 = time()
X_mlle = clf.fit_transform(X)
#Done. Reconstruction error: 0.282968
print("Done. Reconstruction error: %g" %clf.reconstruction_error_)
plot_embedding_2d(X_mlle,"Modified Locally Linear Embedding (time %.2fs)" %(time() - t0))


#hessian 局部线性嵌入(Locally-linear embedding，LLE)从64维降到2维
print("Computing Hessian LLE embedding")
clf = manifold.LocallyLinearEmbedding(n_neighbors,n_components=2,method='hessian')
t0 = time()
X_hlle = clf.fit_transform(X)
#Done. Reconstruction error: 0.158393
print("Done. Reconstruction error: %g" %clf.reconstruction_error_)
plot_embedding_2d(X_hlle,"Hessian Locally Linear Embedding (time %.2fs)" %(time() - t0))



#部分切空间排列算法（LTSA ，Local tangent space alignment) 从64维降到2维
print("Computing LTSA  embedding")
clf = manifold.LocallyLinearEmbedding(n_neighbors,n_components=2,method='ltsa')
t0 = time()
X_ltsa = clf.fit_transform(X)
print("Done. Reconstruction error: %g" %clf.reconstruction_error_)
plot_embedding_2d(X_ltsa,"Local Tangent Space Alignment (time %.2fs)" %(time() - t0))


#多维标度分析（MDS，Multidimensional Scaling）从64维降到2维
print("Computing MDS embedding")
clf= manifold.MDS(n_components=2,n_init=1,max_iter=100)
t0 = time()
X_mds = clf.fit_transform(X)
print("Done. Stress: %f" %clf.stress_)
plot_embedding_2d(X_mds,"MDS (time %.2fs)" %(time()-t0))


#随机森林，从64维降到2维
print("Computing Totally Random Trees embedding")
hasher = ensemble.RandomTreesEmbedding(n_estimators=200,random_state=0,max_depth=5)
t0 = time()
X_transformed = hasher.fit_transform(X)
pca = decomposition.TruncatedSVD(n_components=2)
X_reduced = pca.fit_transform(X_transformed)
plot_embedding_2d(X_reduced,"Random Trees (time %.2fs)" %(time()-t0))


#谱嵌入 从64维降到2维
print("Computing Spectral embedding")
embedder = manifold.SpectralEmbedding(n_components=2,random_state=0,eigen_solver="arpack")
t0 = time()
X_se = embedder.fit_transform(X)
plot_embedding_2d(X_se,"Spectral (time %.2fs)" %(time()-t0))


#t-分布邻域嵌入算法(t-SNE t-distributed stochastic neighbor embedding algorithm) 从64维降到2维
#init设置embedding的初始化方式，可选random或者pca，这里用pca，比起random,init会更stable一些。
print("Computing t-SNE embedding")
tsne = manifold.TSNE(n_components=3,init='pca',random_state=0)
t0 = time()
X_tsne = tsne.fit_transform(X)
#降维后得到X_ tsne，大小是(901,3)
print X_tsne.shape
plot_embedding_2d(X_tsne[:,0:2],"t-SNE 2D")
plot_embedding_3d(X_tsne,"t-SNE 3D (time %.2fs)" %(time()-t0))


plt.show()
