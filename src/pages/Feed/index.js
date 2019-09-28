import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList } from 'react-native';

import LazyImage from '../../components/LazyImage';

import { Post, Header, Avatar, Name, Description, Loading } from './styles';

export default function Feed() {
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useUtate(false);
  const [refreshing, setrefreshing] = useState(false);
  const [view, setView] = useState([])

  async function loadPage(pageNumber = page, shouldRefresh = false){
    
    if(total && pageNumber > total) return;

    setLoading(true)
    
    const response = await fetch(`http://localhost:3000/feed?_expand=author&_limit=5&_page=${pageNumber}`);

    const data = await response.json();
    
    const totalItems = await response.headers.get('X-Total-Count')

    setTotal(Math.floor(totalItems / 5))
    setFeed(shouldRefresh ? data: [...feed, ...data]);
    setPage(pageNumber + 1)
  }
    useEffect(() => {
    loadPage();
    setLoading(false)
  }, []);
  
  async function refreshList(){
    setrefreshing(true)

    await loadPage(1, true);

    setrefreshing(false)
  }

  const handleVienableChanged = useCallback(({ changed }) => {
    setView(changed.map(({ item }) => item.id))
  }, [])
  
  return (
    <View>
      <FlatList 
        data={feed}
        keyExtractor={post => String(post.id)}
        onEndReached={() => loadPage()}
        onEndReachedThreshold={0.1}
        ListFooterComponent={loading && <Loading />}
        onRefresh={refreshList}
        refreshing={refreshing}
        onViewableItemsChanged={handleVienableChanged}
        viewabilityConfig={{viewAreaCoveragePercentThreshold: 10}}
        renderItem={({ item }) => (
          <Post>
            <Header>
              <Avatar source={{uri: item.author.avatar}}></Avatar>
              <Name>{item.author.name}</Name>
            </Header>
            <LazyImage 
              shouldLoad={changed.includes(item.id)}
              aspactRatio={item.aspectRatio}  
              smallSource={{uri: item.small}}
              source={{uri: item.image}}
            />
            <Description>
                <Name>{item.author.name}</Name>{item.description}
            </Description>

            </Post>
        )}
       />
    </View>
  );
}
